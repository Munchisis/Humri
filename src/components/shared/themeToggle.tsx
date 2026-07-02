"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="w-[30px] h-[30px] bg-gray-100 dark:bg-gray-800 rounded-lg" />
    );
  }

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ];

  // Find the current active option (fallback to system if undefined)
  const currentOption =
    options.find((opt) => opt.value === theme) || options[1];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="group flex items-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 p-1 transition-all duration-300">
      {options.map(({ value, icon: Icon }) => {
        const active = theme === value;

        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
          flex h-8 items-center justify-center rounded-lg transition-all duration-300

          ${
            active
              ? "w-8 bg-white dark:bg-gray-700 shadow"
              : "w-0 opacity-0 overflow-hidden group-hover:w-8 group-hover:opacity-100"
          }
        `}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
