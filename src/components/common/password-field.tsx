"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  inputClassName?: string;
};

export function PasswordField({ className = "", inputClassName = "", ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputClasses = inputClassName || "hm-field h-12 w-full";

  return (
    <div className={`relative ${className}`}>
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        className={`${inputClasses} pr-12`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink dark:text-ivory/55 dark:hover:bg-white/10 dark:hover:text-ivory"
        aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        title={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {isVisible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
