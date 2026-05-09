interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
}

export function Icon({ name, size = 16, stroke = 1.6, color = "currentColor", className }: IconProps) {
  const c = color, s = stroke;
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: c, strokeWidth: s,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    className,
  };
  switch (name) {
    case "sun":
      return (<svg {...props}><circle cx="12" cy="12" r="3.4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>);
    case "horizon":
      return (<svg {...props}><circle cx="12" cy="14" r="3"/><path d="M3 18h18M5.5 12 7 13.5M17 13.5 18.5 12M12 8v2"/></svg>);
    case "moon":
      return (<svg {...props}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>);
    case "candle":
      return (<svg {...props}><path d="M12 3c1.5 1.5 1.5 3 0 4-1.5-1-1.5-2.5 0-4Z"/><rect x="8" y="9" width="8" height="11" rx="1.4"/><path d="M10 13h4"/></svg>);
    case "book":
      return (<svg {...props}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h12"/></svg>);
    case "compass":
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-5 2 2-5 5-2Z"/></svg>);
    case "users":
      return (<svg {...props}><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.6-2.7 2.8-4.5 5.5-4.5s4.9 1.8 5.5 4.5"/><circle cx="17" cy="8" r="2.6"/><path d="M15 14.6c2.5 0 4.5 1.6 5 4"/></svg>);
    case "calendar":
      return (<svg {...props}><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>);
    case "scale":
      return (<svg {...props}><path d="M12 4v16M5 8h14M5 8l-2 6a3 3 0 0 0 6 0L7 8M19 8l-2 6a3 3 0 0 0 6 0l-2-6"/></svg>);
    case "milestones":
      return (<svg {...props}><circle cx="6" cy="18" r="2"/><circle cx="12" cy="11" r="2"/><circle cx="18" cy="5" r="2"/><path d="M7.4 16.6 10.6 12.4M13.4 9.4 16.6 6.6"/></svg>);
    case "alef":
      return (<svg {...props}><path d="M5 5c5 1 9 6 14 14M19 5C13 7 9 11 5 19"/></svg>);
    case "search":
      return (<svg {...props}><circle cx="10.5" cy="10.5" r="6"/><path d="m20 20-5.4-5.4"/></svg>);
    case "play":
      return (<svg {...props}><path d="M7 5v14l12-7L7 5Z" fill={c}/></svg>);
    case "chevR":
      return (<svg {...props}><path d="m9 6 6 6-6 6"/></svg>);
    case "chevL":
      return (<svg {...props}><path d="m15 6-6 6 6 6"/></svg>);
    case "x":
      return (<svg {...props}><path d="M6 6 18 18M18 6 6 18"/></svg>);
    case "translate":
      return (<svg {...props}><path d="M4 6h10M9 4v2c0 4-2.5 7-5 9M5 11c1.5 2.5 4 4.5 8 5M14 20l4-9 4 9M16 17h4"/></svg>);
    case "menu":
      return (<svg {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>);
    case "speaker":
      return (<svg {...props}><path d="M5 9.5h3l4-3.5v12l-4-3.5H5v-5Z"/><path d="M16 9c1 1 1.5 2 1.5 3s-.5 2-1.5 3"/></svg>);
    default:
      return null;
  }
}
