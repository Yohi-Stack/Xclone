const sizeMap = {
  sm: "loading-sm",
  md: "loading-md",
  lg: "loading-lg",
  xl: "loading-xl",
};

const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClass = sizeMap[size] || sizeMap["md"];

  return (
    <span className={`loading loading-spinner ${sizeClass} ${className}`} />
  );
};

export default LoadingSpinner;
