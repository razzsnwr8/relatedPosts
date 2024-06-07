import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';

export function TitleEdit({ initialTitle, onSave, postId, style }){
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    onSave(title, postId); // Pass updated title to onSave
  };

  const handleChange = (newTitle) => {
    setTitle(newTitle);
  };

  return (        
    <div>
      {
        isEditing ? (
          <>
            <RichText 
              tagName='h4'
              value={title}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
            />
          </>
        ) : (
          <h4 onDoubleClick={handleDoubleClick} className='relatedPostTitle' style={style}>{title}</h4>
        )
      }
    </div>
  );
};
