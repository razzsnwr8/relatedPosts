import { useBlockProps, RichText } from '@wordpress/block-editor';
import { ExtractTextFromHTML } from './custom-hook/useCustomHook';

export default function save({ attributes }) {
	const { relatedPosts, heading, colorValue, backgroundColor, textAlign, relatedPostsTitle, relatedPostsDescription, columnValue, postToDisplay, headingTags } = attributes;
	const handlePostClick = (e, postLink) => {
		e.preventDefault(); // Prevents the default link behavior (opening in a new page)
		window.location.href = postLink; // Redirect to the post link
	};

	const headingStyle = { 
		color : colorValue, 
		background: backgroundColor, 
		textAlign:textAlign,
	};


	return (
		<>
			<div { ...useBlockProps.save() }>
				<div>
					{relatedPosts && relatedPosts.length > 0  ? (
						<ul>
							<RichText.Content
								tagName={headingTags}
								value={heading || "Related Post"}
								style={headingStyle}
								/>
							<div className={`relatedPost relatedPostColumns-${columnValue}`}>
								{relatedPosts.slice(0,  postToDisplay).map((post, index) => (
									<li key={index} className='relatedPostList'>
										<h4><a href={post.link} style={{ color: relatedPostsTitle }} onClick={(e) => handlePostClick(e, post.link)} className='renderedPost'>{post.title}</a></h4>
										<p style={{ color: relatedPostsDescription }}>{ExtractTextFromHTML(post.content)}</p>
									</li>
								))}
							</div>
						</ul>
					):(			
						<RichText.Content
						tagName={headingTags}
						value={heading || "No related Post"}
						style={headingStyle}
						/>
					)}
				</div>
			</div>
		</>
	);
};
