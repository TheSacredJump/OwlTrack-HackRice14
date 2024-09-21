import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  bgVariant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  textVariant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success';
  IconLeft?: React.ReactNode;
  IconRight?: React.ReactNode;
  className?: string;
}

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch(variant) {
    case "secondary":
      return 'bg-gray-500';
    case "danger":
      return 'bg-red-500';
    case "success":
      return 'bg-green-500';
    case "outline":
      return 'bg-transparent border-neutral-300 border';
    default:
      return 'bg-[#00205b]';
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch(variant) {
    case "primary":
      return 'text-black';
    case "secondary":
      return 'text-gray-100';
    case "danger":
      return 'text-red-500';
    case "success":
      return 'text-green-500';
    default:
      return 'text-white';
  }
};

const CustomButton: React.FC<ButtonProps> = ({ 
  onClick, 
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft, 
  IconRight,
  className,
  ...props
}) => (
  <button
    onClick={onClick}
    className={`w-full p-3 rounded-full flex justify-center items-center shadow-md ${getBgVariantStyle(bgVariant)} ${className}`}
    {...props}
  >
    {IconLeft && <span className="mr-2">{IconLeft}</span>}
    <span className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}>{title}</span>
    {IconRight && <span className="ml-2">{IconRight}</span>}
  </button>
);

export default CustomButton;