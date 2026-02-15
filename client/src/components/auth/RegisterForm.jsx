import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Lock,
  Globe,
  Eye,
  EyeOff,
  UserPlus,
  Plus,
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  register as registerUser,
  clearError,
} from "../../store/slices/authSlice";
import toast from "react-hot-toast";

// Password strength checker
const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const strengthMap = {
    0: { label: "Very Weak", color: "bg-red-500", textColor: "text-red-500" },
    1: { label: "Weak", color: "bg-red-400", textColor: "text-red-400" },
    2: { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-500" },
    3: { label: "Good", color: "bg-blue-500", textColor: "text-blue-500" },
    4: { label: "Strong", color: "bg-green-500", textColor: "text-green-500" },
    5: {
      label: "Very Strong",
      color: "bg-green-600",
      textColor: "text-green-600",
    },
    6: {
      label: "Excellent",
      color: "bg-green-700",
      textColor: "text-green-700",
    },
  };

  return {
    score: Math.min(score, 6),
    ...(strengthMap[Math.min(score, 6)] || strengthMap[0]),
  };
};

// Validation schema
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      )
      .min(1, "Username is required"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    nativeLanguage: z.string().min(1, "Please select your native language"),
    learningLanguages: z
      .array(
        z.object({
          language: z.string(),
          level: z.enum(["beginner", "intermediate", "advanced", "fluent"]),
        }),
      )
      .optional()
      .default([]),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Russian",
  "Arabic",
  "Hindi",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Greek",
  "Turkish",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Other",
];

const proficiencyLevels = [
  {
    value: "beginner",
    label: "Beginner",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "advanced",
    label: "Advanced",
    color: "bg-purple-100 text-purple-800",
  },
  { value: "fluent", label: "Fluent", color: "bg-yellow-100 text-yellow-800" },
];

const RegisterForm = ({ onToggleMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });
  const [learningLanguages, setLearningLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      acceptTerms: false,
      learningLanguages: [],
    },
  });

  const watchPassword = watch("password", "");

  // Update password strength when password changes
  useEffect(() => {
    if (watchPassword) {
      setPasswordStrength(checkPasswordStrength(watchPassword));
    }
  }, [watchPassword]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      console.log("🔵 RegisterForm onSubmit - Form data:", data);

      // Remove confirmPassword and acceptTerms from the data sent to backend
      const { confirmPassword, acceptTerms, ...registerData } = data;

      // Ensure learningLanguages is included
      registerData.learningLanguages = learningLanguages;

      console.log("🔵 RegisterForm - Sending to backend:", registerData);

      const result = await dispatch(registerUser(registerData)).unwrap();

      console.log("🔵 RegisterForm - Success result:", result);
      toast.success("Account created successfully! 🎉");
      navigate("/onboarding");
    } catch (error) {
      console.error("🔴 RegisterForm - Error caught:", error);

      // Show specific error message
      if (typeof error === "string") {
        toast.error(error);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  const addLearningLanguage = () => {
    if (selectedLanguage) {
      // Check if language already exists
      const exists = learningLanguages.some(
        (lang) => lang.language === selectedLanguage,
      );

      if (!exists) {
        const newLanguage = {
          language: selectedLanguage,
          level: selectedLevel,
        };

        const newLanguages = [...learningLanguages, newLanguage];
        setLearningLanguages(newLanguages);
        setValue("learningLanguages", newLanguages);
        setSelectedLanguage("");
        setSelectedLevel("beginner");
      } else {
        toast.error(`${selectedLanguage} is already in your list`);
      }
    }
  };

  const removeLearningLanguage = (langToRemove) => {
    const newLanguages = learningLanguages.filter(
      (lang) => lang.language !== langToRemove,
    );
    setLearningLanguages(newLanguages);
    setValue("learningLanguages", newLanguages);
  };

  const updateLanguageLevel = (language, newLevel) => {
    const newLanguages = learningLanguages.map((lang) =>
      lang.language === language ? { ...lang, level: newLevel } : lang,
    );
    setLearningLanguages(newLanguages);
    setValue("learningLanguages", newLanguages);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Username <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            id="username"
            type="text"
            {...register("username")}
            className={`w-full pl-10 pr-3 py-2 border ${errors.username ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="johndoe123"
          />
        </div>
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`w-full pl-10 pr-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Native Language */}
      <div>
        <label
          htmlFor="nativeLanguage"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Native Language <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Globe
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            id="nativeLanguage"
            {...register("nativeLanguage")}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition"
          >
            <option value="">Select your native language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        {errors.nativeLanguage && (
          <p className="mt-1 text-sm text-red-600">
            {errors.nativeLanguage.message}
          </p>
        )}
      </div>

      {/* Learning Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Languages you're learning (Optional)
        </label>

        <div className="space-y-3">
          {/* Language and Level Selection Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Language Select */}
            <div className="flex-1">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Select language</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Select */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <span>
                  {proficiencyLevels.find((l) => l.value === selectedLevel)
                    ?.label || "Level"}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showLevelDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg animate-fadeIn">
                  {proficiencyLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => {
                        setSelectedLevel(level.value);
                        setShowLevelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition ${
                        selectedLevel === level.value ? "bg-blue-50" : ""
                      }`}
                    >
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${level.color}`}
                      >
                        {level.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={addLearningLanguage}
              disabled={!selectedLanguage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Selected Languages with Levels */}
          {learningLanguages.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500">
                {learningLanguages.length} language(s) selected
              </p>
              <div className="flex flex-wrap gap-2">
                {learningLanguages.map((lang) => (
                  <div
                    key={lang.language}
                    className="group relative inline-flex items-center px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200 hover:border-blue-300 transition-all"
                  >
                    <span className="text-sm font-medium text-blue-800 mr-2">
                      {lang.language}
                    </span>

                    {/* Level Dropdown */}
                    <select
                      value={lang.level}
                      onChange={(e) =>
                        updateLanguageLevel(lang.language, e.target.value)
                      }
                      className="text-xs bg-transparent border-l border-blue-200 pl-2 pr-6 py-0.5 focus:outline-none cursor-pointer hover:bg-blue-100 rounded-r-full transition"
                    >
                      {proficiencyLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeLearningLanguage(lang.language)}
                      className="ml-1 p-0.5 text-blue-400 hover:text-blue-600 hover:bg-blue-200 rounded-full transition-colors"
                      aria-label={`Remove ${lang.language}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`w-full pl-10 pr-10 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}

        {/* Password Strength Indicator */}
        {watchPassword && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Password strength:</span>
              <span
                className={`text-xs font-medium ${passwordStrength.textColor}`}
              >
                {passwordStrength.label}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                style={{
                  width: `${(passwordStrength.score / 6) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Use at least 8 characters with letters, numbers & symbols
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            className={`w-full pl-10 pr-10 py-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}

        {/* Password Match Indicator */}
        {watchPassword &&
          watch("confirmPassword") &&
          watchPassword === watch("confirmPassword") && (
            <div className="mt-1 flex items-center text-xs text-green-600">
              <CheckCircle size={14} className="mr-1" />
              Passwords match
            </div>
          )}
      </div>

      {/* Terms Acceptance */}
      <div className="space-y-2">
        <label className="flex items-start cursor-pointer group">
          <input
            type="checkbox"
            {...register("acceptTerms")}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 animate-fadeIn">
          <AlertCircle
            className="text-red-500 mt-0.5 flex-shrink-0"
            size={18}
          />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-base flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="mr-2" size={18} />
              <span>Create Account</span>
            </>
          )}
        </button>
      </div>

      {/* Toggle to Login */}
      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onToggleMode}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
