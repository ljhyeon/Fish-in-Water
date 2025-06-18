import { Box, Typography } from "@mui/material"

export function NonData({ children }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%',minHeight: 'calc(100vh - 180px)', gap: 2 }}>
            <img src="/non_fish.svg" style={{ width: '300px', height: 'auto' }} />
            <Typography variant="h5" color="text.secondary" fontWeight="bold" sx={{ mb: 2 }}>
                {children}
            </Typography>
        </Box>
    )
}