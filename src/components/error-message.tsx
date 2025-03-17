import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type ErrorSeverity = "error" | "warning" | "info";

type ErrorMessageProps = {
  title: string;
  message: string;
  severity?: ErrorSeverity;
  className?: string;
};

export function ErrorMessage({
  title,
  message,
  severity = "error",
  className = "",
}: ErrorMessageProps) {
  const getAlertStyles = () => {
    switch (severity) {
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-red-200 bg-red-50";
    }
  };

  const getIcon = () => {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getTitleColor = () => {
    switch (severity) {
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
        return "text-blue-800";
      default:
        return "text-red-800";
    }
  };

  const getDescriptionColor = () => {
    switch (severity) {
      case "error":
        return "text-red-700";
      case "warning":
        return "text-yellow-700";
      case "info":
        return "text-blue-700";
      default:
        return "text-red-700";
    }
  };

  return (
    <Alert className={`${getAlertStyles()} ${className}`}>
      {getIcon()}
      <AlertTitle className={getTitleColor()}>{title}</AlertTitle>
      <AlertDescription className={getDescriptionColor()}>
        {message}
      </AlertDescription>
    </Alert>
  );
}
