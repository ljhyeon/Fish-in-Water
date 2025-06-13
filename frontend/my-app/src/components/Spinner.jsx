// 스피너 컴포넌트 - 순수 CSS 애니메이션 사용
export const Spinner = ({ size = 'medium' }) => {
    const sizeMap = {
        small: '16px',
        medium: '32px',
        large: '48px'
    };

    const spinnerStyle = {
        width: sizeMap[size],
        height: sizeMap[size],
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={spinnerStyle} />
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// 로딩 오버레이 컴포넌트 - 순수 CSS 스타일 사용
export const LoadingOverlay = ({ isVisible, message = "처리 중..." }) => {
    if (!isVisible) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    };

    const contentStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    };

    const textStyle = {
        color: 'white',
        fontSize: '18px',
        fontWeight: '500',
        textAlign: 'center',
    };

    return (
        <div style={overlayStyle}>
            <div style={contentStyle}>
                <Spinner size="large" />
                <p style={textStyle}>{message}</p>
            </div>
        </div>
    );
};