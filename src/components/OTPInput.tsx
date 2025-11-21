import React, { useState, useRef } from 'react';

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length,
  onComplete,
  error = false,
}) => {
  const [value, setValue] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, inputValue: string) => {
    if (!/^\d*$/.test(inputValue)) return;

    const newValue = [...value];
    newValue[index] = inputValue.slice(-1);
    setValue(newValue);

    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const otp = newValue.join('');
    if (otp.length === length) {
      onComplete(otp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newValue = [...value];

    for (let i = 0; i < Math.min(pastedData.length, length); i++) {
      newValue[i] = pastedData[i];
    }

    setValue(newValue);
    const otp = newValue.join('');
    if (otp.length === length) {
      onComplete(otp);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-center gap-2 sm:gap-3 w-full">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`flex-1 max-w-[50px] sm:max-w-[60px] aspect-square text-center text-lg sm:text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : value[index]
                ? 'border-blue-500'
                : 'border-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
