import { Box, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export function ImageWithBackButton({ 
    src, 
    aspectRatio = '1 / 0.85', 
    onBackClick 
}) {
    return (
        <Box sx={{
            width: '100%',
            aspectRatio: aspectRatio,
            overflow: 'hidden',
            position: 'relative'
        }}>
            <img 
                src={src}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                }}
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