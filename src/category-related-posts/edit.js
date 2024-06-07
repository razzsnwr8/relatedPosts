import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, ColorPaletteControl, InspectorControls, BlockControls, AlignmentToolbar } from '@wordpress/block-editor';
import { Panel, PanelBody, PanelRow, RangeControl, SelectControl, __experimentalNumberControl as NumberControl } from "@wordpress/components";
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import './editor.scss';
import { TitleEdit } from './components/titleEdit';
import { ExtractTextFromHTML } from './custom-hook/useCustomHook';

export default function Edit({ attributes, setAttributes }) {
	const { heading, colorValue, backgroundColor, textAlign, relatedPostsTitle, relatedPostsDescription, columnValue, postToDisplay, headingTags } = attributes;
	// console.log("Column value:", colorValue);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const currentPostId = select("core/editor").getCurrentPostId();
				// console.log("Currently Open Post ID: ", currentPostId);

				// Fetch the data for the current post including the categories field
				const currentPostData = await apiFetch({
					path: `/wp/v2/posts/${currentPostId}?_fields=categories`
				});
				// console.log("current post data", currentPostData);

				// Fetch categories of the current post
				const categories = currentPostData.categories;
				// console.log("Categories of Current Post:", categories);

				//Fetch all posts
				const allPosts = await apiFetch({ 
					path:`/wp/v2/posts?per_page=100` // add per_page=100 because wordpress API has default value of 10 posts per_page
				});
				// console.log("Check all the post: ", allPosts);

				// Filter post based on specific categories
				const relatedPosts = allPosts.filter(post => {
					return post.categories.some(categoryId => {
						return categories.includes(categoryId)
					}) && post.id !== currentPostId;
				});
				// console.log("Related Post", relatedPosts);

				// Extract post titles from relatedPosts
				const relatedPostData = relatedPosts.map(post => ({
					id: post.id,
					title: post.title.rendered,
					content: ExtractTextFromHTML(post.content.rendered), // get first 150 characters
					link: post.link
				}));
				// console.log("relatect post-data result:", relatedPostData)
				setAttributes({ relatedPosts: relatedPostData }); // Update block attributes with related post titles
			} catch (error){
				console.error("Error fetching related posts:", error);
			};
		};
		fetchData();
	}, [setAttributes]);

	const handleTitleChange = async (newTitle, postId) => {
		try {
			await apiFetch({
				path:`/wp/v2/posts/${postId}`,
				method: 'POST',
				data: { title: newTitle },
			});

			const updateRelatedPosts = attributes.relatedPosts.map(post => {
				if (post.id === postId){
					return { ...post, title: newTitle };
				}
				return post;
			});
			setAttributes({ relatedPosts: updateRelatedPosts }); // Update block attributes with the new title
		} catch (error) {
			console.error("Error updating post title: ", error);
		};
	};

	// change heading
	const onRelatedHeadingChange = (newHeading) => {
		setAttributes({ heading: newHeading });
	};

	// change text color
	const onColorChange = (color) => {
		setAttributes({ colorValue: color });
	};

	// change background color
	const onBackgroundColorChange = (background) => {
    setAttributes({ backgroundColor: background });
	};

	// text alignment
	const onAlignmentChange = (align) => {
    setAttributes({ textAlign: align });
	};

	// text relatedPost title color change
	const onRelatedPostTitleChange = (color) => {
		setAttributes({ relatedPostsTitle: color });
	};

	// text relatedPost description color change
	const onRelatedPostDescriptionChange = (color) => {
		setAttributes({ relatedPostsDescription: color });
	};

	// set related post columns
	const onColumnSet = (value) => {
		setAttributes({ columnValue: value });
	};

	// post to display
		const postDisplay = (value) => {
			setAttributes({ postToDisplay: value });
		};

	// set heading 1
	const setHeadings = (value) => {
		setAttributes({ headingTags: value });
	};


	return (
	<div { ...useBlockProps() }>
		<div>
			<BlockControls>
				<>
					<AlignmentToolbar value={textAlign} onChange={onAlignmentChange}/>
					<SelectControl 
						value={headingTags} 
						options={[
							{ label: 'H1', tagName: 'h1' },
							{ label: 'H2', tagName: 'h2' },
							{ label: 'H3', tagName: 'h3' },
							{ label: 'H4', tagName: 'h4' },
							{ label: 'H5', tagName: 'h5' },
							{ label: 'H6', tagName: 'h6' },
					]} 
						onChange={setHeadings}
					/>
				</>							
			</BlockControls>
			<InspectorControls>
				<Panel header='Styles' initialOpen={false} >
					<PanelBody title="Color" initialOpen={false}>
						<PanelRow tagName='h6'>Header Text Color</PanelRow>
						<ColorPaletteControl value={colorValue} onChange={onColorChange} />
						<PanelRow>Header Background Color</PanelRow>
						<ColorPaletteControl value={backgroundColor} onChange={onBackgroundColorChange} /> 
						<PanelRow>Title Color</PanelRow>
						<ColorPaletteControl value={relatedPostsTitle} onChange={onRelatedPostTitleChange} />						
						<PanelRow>Description Color</PanelRow>
						<ColorPaletteControl value={relatedPostsDescription} onChange={onRelatedPostDescriptionChange} />
					</PanelBody>
					<PanelBody title="Related Post" initialOpen={false}>
						<NumberControl
							value={postToDisplay}
							min={1}
							max={6}
							step={1}
							isShiftStepEnabled={ false }
							onChange={postDisplay}
						/>
					</PanelBody>
					<PanelBody title="Posts Column" initialOpen={false}>
						<RangeControl
							label='Columns'
							value={columnValue}
							min={1}
							max={4}
							step={1}
							onChange={onColumnSet}
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>
			{ attributes.relatedPosts && attributes.relatedPosts.length > 0 ? (
				<ul>
					<div className='richText'>
						<RichText 
							tagName={headingTags}
							value={heading || "Related Post"}
							onChange={onRelatedHeadingChange}
							style={{ color: colorValue, background: backgroundColor, textAlign:textAlign }}
							allowedFormats={['core/bold', 'core/italic']}
						/>
					</div>
					<div className={`relatedPost relatedPostColumns-${columnValue}`}>
						{
							attributes.relatedPosts.slice(0,  postToDisplay).map((post) => (
								<li key={post.id} className='relatedPostList'>
									<TitleEdit 
										initialTitle={post.title} 
										onSave={handleTitleChange}
										postId={post.id}
										style={{ color: relatedPostsTitle }}
									/>
									<p className='relatedpostContent' style={{ color: relatedPostsDescription  }}>{post.content}</p>
								</li>
							))
						}
					</div>
				</ul>
				) : (
					<RichText 
					tagName={headingTags}
					value={heading || "No Related Post"}
					onChange={onRelatedHeadingChange}
					style={{ color: colorValue, background: backgroundColor, textAlign:textAlign }}
					allowedFormats={['core/bold', 'core/italic']}
				/>
				)
			}
		</div>
	</div>
	);
};