const Loading = ({ message, textSize = "text-2xl", iconSize = "w-2 h-2", iconColor = "bg-primary" }) => {
    return (
        <div className={`flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 dark:text-slate-400 ${textSize}`}>
            <span className="mr-3">{message}</span>
            <div className="flex space-x-1.5 items-center mt-1">
                <div className={`${iconSize} ${iconColor} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
                <div className={`${iconSize} ${iconColor} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
                <div className={`${iconSize} ${iconColor} rounded-full animate-bounce`}></div>
            </div>
        </div>
    );
};

export default Loading;