import { Box, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useRef, useState } from "react";

export function ImageInputWithBackButton({ 
    aspectRatio = '1 / 0.85', 
    onBackClick,
    onImageSelect,
    placeholder = "이미지를 선택하세요",
    initialImage = null
}) {
    const [selectedImage, setSelectedImage] = useState(initialImage);
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
                onImageSelect?.(file, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box sx={{
            width: '100%',
            aspectRatio: aspectRatio,
            overflow: 'hidden',
            position: 'relative',
            border: selectedImage ? 'none' : '2px dashed #ccc',
            cursor: 'pointer',
            backgroundColor: selectedImage ? 'transparent' : '#f5f5f5'
        }}>
            {selectedImage ? (
                <img 
                    src={selectedImage}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                    onClick={handleImageClick}
                />
            ) : (
                <Box
                    onClick={handleImageClick}
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        color: '#666'
                    }}
                >
                    <AddPhotoAlternateIcon sx={{ fontSize: 48 }} />
                    <span>{placeholder}</span>
                </Box>
            )}
            
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            
            <IconButton
                onClick={onBackClick}
                sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    color: 'black',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                }}
                size="small"
            >
                <ArrowBackIosNewIcon />
            </IconButton>
        </Box>
    );
}