import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-xl', wheel: 'w-6 h-6' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', wheel: 'w-8 h-8' },
    lg: { icon: 'w-14 h-14', text: 'text-4xl', wheel: 'w-12 h-12' },
  };
  
  return (
    <Link to="/" className="flex items-center gap-2 group">
      {/* Custom Logo Icon */}
      <div className={`${sizes[size].icon} relative`}>
        {/* Motorcycle wheel/gear design */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer ring */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Inner gear teeth */}
          <path
            d="M24 8L26 12H22L24 8Z"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M24 40L22 36H26L24 40Z"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M8 24L12 22V26L8 24Z"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M40 24L36 26V22L40 24Z"
            fill="currentColor"
            className="text-primary"
          />
          
          {/* Diagonal teeth */}
          <path
            d="M12.5 12.5L15.5 14.5L13.5 16.5L12.5 12.5Z"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M35.5 35.5L32.5 33.5L34.5 31.5L35.5 35.5Z"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M35.5 12.5L33.5 15.5L31.5 13.5L35.5 12.5Z"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M12.5 35.5L14.5 32.5L16.5 34.5L12.5 35.5Z"
            fill="currentColor"
            className="text-primary"
          />
          
          {/* Center M shape */}
          <path
            d="M16 28V20L20 24L24 18L28 24L32 20V28"
            stroke="url(#logoGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Inner circle */}
          <circle
            cx="24"
            cy="24"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-primary/30"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Animated pulse ring on hover */}
        <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500" />
      </div>
      
      {showText && (
        <span className={`font-display ${sizes[size].text} text-secondary-foreground tracking-wider`}>
          MOTO<span className="text-primary">LINK</span>
        </span>
      )}
    </Link>
  );
}
