const Container = ({ children, className = '', size = 'default' }) => {
  const maxW = size === 'narrow' ? 'max-w-4xl' : size === 'wide' ? 'max-w-[1400px]' : 'max-w-7xl';
  return (
    <div className={`${maxW} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
