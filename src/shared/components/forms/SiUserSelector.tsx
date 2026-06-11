import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Lock } from "lucide-react";
import { searchAllSiUsers, getSiUserMirrorByCode, type SiUserMirror } from "../../data/siUserMirrorStorage";

type SiUserSelectorProps = {
  value: string; // integralSystemUserId
  onChange: (userId: string, userValue: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
};

export default function SiUserSelector({
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}: SiUserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedUser = useMemo(() => {
    if (!value) return null;
    return getSiUserMirrorByCode(value);
  }, [value]);

  const filteredUsers = useMemo(() => {
    return searchAllSiUsers(searchQuery);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectUser = (user: SiUserMirror) => {
    if (user.status === "Inactivo") {
      return;
    }
    onChange(user.integralSystemUserId, user.integralSystemUserValue);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("", "");
    setSearchQuery("");
  };

  const displayValue = selectedUser
    ? `${selectedUser.integralSystemUserId} - ${selectedUser.integralSystemUserValue}`
    : "";

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="mb-1 flex items-center gap-2">
        <label className="inline-flex items-baseline gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
            Usuario Sistema Integral
            {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      </div>

      <div className="relative">
        {/* Input field */}
        <div
          className={`relative flex items-center rounded-md border px-3 py-2 text-sm transition-colors ${
            error
              ? "border-red-500 bg-white focus-within:ring-2 focus-within:ring-red-200"
              : "border-slate-300 bg-white focus-within:ring-2"
          } ${disabled ? "bg-slate-100 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedUser ? (
            <div className="flex flex-1 items-center justify-between">
              <span className="text-slate-900">{displayValue}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="ml-2 rounded-full p-1 hover:bg-slate-100"
                >
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                disabled={disabled}
                className="flex-1 bg-transparent outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
            </div>
          )}

          {!disabled && (
            <ChevronDown
              size={16}
              className={`ml-2 text-slate-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
            {filteredUsers.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                No se encontraron usuarios
              </div>
            ) : (
              <div className="py-1">
                {filteredUsers.map((user) => {
                  const isInactive = user.status === "Inactivo";
                  return (
                    <button
                      key={user.integralSystemUserId}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      disabled={isInactive}
                      className={`w-full px-3 py-2 text-left text-sm focus:outline-none ${
                        isInactive
                          ? "cursor-not-allowed bg-slate-50"
                          : "hover:bg-slate-50 focus:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isInactive ? "text-slate-400" : "text-slate-900"}`}>
                          {user.integralSystemUserId} - {user.integralSystemUserValue}
                        </span>
                        {isInactive && (
                          <Lock size={14} className="text-slate-400" />
                        )}
                      </div>
                      {isInactive && (
                        <span className="text-xs text-slate-500">Inactivo</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <span className="mt-1 block text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
