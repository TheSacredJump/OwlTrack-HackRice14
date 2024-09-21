import React from 'react';
import Image from 'next/image';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelStyle?: string;
  icon?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  labelStyle,
  icon,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}) => (
  <div className={`my-2 w-full ${className}`}>
    <label className={`block text-lg font-bold mb-3 ${labelStyle}`}>
      {label}
    </label>
    <div className={`flex items-center relative bg-modal rounded-full border border-outline/50 focus-within:border-primary-500 ${containerStyle}`}>
      {icon && (
        <div className="ml-4">
          <Image src={icon} width={24} height={24} alt={label} className={iconStyle} />
        </div>
      )}
      <input 
        className={`rounded-full p-4 font-semibold text-[15px] flex-1 bg-transparent outline-none ${inputStyle}`}
        {...props}
      />
    </div>
  </div>
);

export default InputField;