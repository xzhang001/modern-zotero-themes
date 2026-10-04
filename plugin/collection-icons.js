/* Custom collection icons: a vendored Lucide subset (lucide-static 1.52.0, ISC; see THIRD_PARTY_NOTICES.md),
   icon colors, entry validation, generated CSS, and the picker panel. Shared by Zotero and tests. */
(function (scope) {
  "use strict";
  // Inner SVG markup on Lucide's 24x24 stroke grid; drawn as CSS masks so the color follows the theme.
  const icons = Object.freeze({
    "folder": '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    "folder-open": '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
    "book-open": '<path d="M12 5v16"/> <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/>',
    "book-marked": '<path d="M10 2v7.751a.25.25 0 00.407.195l2.28-1.834a.5.5 0 01.627 0l2.28 1.834A.25.25 0 0016 9.751V2"/> <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H19a1 1 0 011 1v18a1 1 0 01-1 1H6.5a1 1 0 010-5H20"/>',
    "bookmark": '<path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>',
    "library": '<path d="m16 6 4 14"/> <path d="M12 6v14"/> <path d="M8 8v12"/> <path d="M4 4v16"/>',
    "notebook": '<path d="M2 6h4"/> <path d="M2 10h4"/> <path d="M2 14h4"/> <path d="M2 18h4"/> <rect width="16" height="20" x="4" y="2" rx="2"/> <path d="M16 2v20"/>',
    "notebook-pen": '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/> <path d="M2 6h4"/> <path d="M2 10h4"/> <path d="M2 14h4"/> <path d="M2 18h4"/> <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
    "file-text": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/> <path d="M14 2v5a1 1 0 0 0 1 1h5"/> <path d="M10 9H8"/> <path d="M16 13H8"/> <path d="M16 17H8"/>',
    "files": '<path d="M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/> <path d="M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z"/> <path d="M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1"/>',
    "newspaper": '<path d="M15 18h-5"/> <path d="M18 14h-8"/> <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/> <rect width="8" height="4" x="10" y="6" rx="1"/>',
    "scroll-text": '<path d="M15 12h-5"/> <path d="M15 8h-5"/> <path d="M19 17V5a2 2 0 0 0-2-2H4"/> <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    "quote": '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/> <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
    "highlighter": '<path d="m9 11-6 6v3h9l3-3"/> <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
    "pencil": '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/> <path d="m15 5 4 4"/>',
    "sticky-note": '<path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/> <path d="M15 3v5a1 1 0 0 0 1 1h5"/>',
    "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/> <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/> <path d="M12 11h4"/> <path d="M12 16h4"/> <path d="M8 11h.01"/> <path d="M8 16h.01"/>',
    "presentation": '<path d="M2 3h20"/> <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/> <path d="m7 21 5-5 5 5"/>',
    "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/> <path d="M22 10v6"/> <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    "school": '<path d="M14 21v-3a2 2 0 0 0-4 0v3"/> <path d="M18 4.933V21"/> <path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6"/> <path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11"/> <path d="M6 4.933V21"/> <circle cx="12" cy="9" r="2"/>',
    "archive": '<rect width="20" height="5" x="2" y="3" rx="1"/> <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/> <path d="M10 12h4"/>',
    "inbox": '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/> <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    "flask-conical": '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/> <path d="M6.453 15h11.094"/> <path d="M8.5 2h7"/>',
    "test-tube": '<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2"/> <path d="M8.5 2h7"/> <path d="M14.5 16h-5"/>',
    "microscope": '<path d="M6 18h8"/> <path d="M3 22h18"/> <path d="M14 22a7 7 0 1 0 0-14h-1"/> <path d="M9 14h2"/> <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/> <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
    "telescope": '<path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/> <path d="m13.56 11.747 4.332-.924"/> <path d="m16 21-3.105-6.21"/> <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/> <path d="m6.158 8.633 1.114 4.456"/> <path d="m8 21 3.105-6.21"/> <circle cx="12" cy="13" r="2"/>',
    "atom": '<circle cx="12" cy="12" r="1"/> <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/> <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',
    "dna": '<path d="m10 16 1.5 1.5"/> <path d="m14 8-1.5-1.5"/> <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/> <path d="m16.5 10.5 1 1"/> <path d="m17 6-2.891-2.891"/> <path d="M2 15c6.667-6 13.333 0 20-6"/> <path d="m20 9 .891.891"/> <path d="M3.109 14.109 4 15"/> <path d="m6.5 12.5 1 1"/> <path d="m7 18 2.891 2.891"/> <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/>',
    "brain": '<path d="M12 18V5"/> <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/> <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/> <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/> <path d="M18 18a4 4 0 0 0 2-7.464"/> <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/> <path d="M6 18a4 4 0 0 1-2-7.464"/> <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/>',
    "orbit": '<path d="M20.341 6.484A10 10 0 0 1 10.266 21.85"/> <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152"/> <circle cx="12" cy="12" r="3"/> <circle cx="19" cy="5" r="2"/> <circle cx="5" cy="19" r="2"/>',
    "magnet": '<path d="m12 15 4 4"/> <path d="M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282z"/> <path d="m5 8 4 4"/>',
    "zap": '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
    "thermometer": '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
    "leaf": '<path d="M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20"/> <path d="M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13"/>',
    "sprout": '<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/> <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/> <path d="M5 21h14"/>',
    "trees": '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/> <path d="M7 16v6"/> <path d="M13 19v3"/> <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
    "mountain": '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
    "waves": '<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0"/> <path d="M2 19q2.5 2 5 0t5 0 5 0 5 0"/> <path d="M2 5q2.5 2 5 0t5 0 5 0 5 0"/>',
    "sun": '<circle cx="12" cy="12" r="4"/> <path d="M12 2v2"/> <path d="M12 20v2"/> <path d="m4.93 4.93 1.41 1.41"/> <path d="m17.66 17.66 1.41 1.41"/> <path d="M2 12h2"/> <path d="M20 12h2"/> <path d="m6.34 17.66-1.41 1.41"/> <path d="m19.07 4.93-1.41 1.41"/>',
    "moon": '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
    "cloud": '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    "globe": '<circle cx="12" cy="12" r="10"/> <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/> <path d="M2 12h20"/>',
    "cpu": '<path d="M12 20v2"/> <path d="M12 2v2"/> <path d="M17 20v2"/> <path d="M17 2v2"/> <path d="M2 12h2"/> <path d="M2 17h2"/> <path d="M2 7h2"/> <path d="M20 12h2"/> <path d="M20 17h2"/> <path d="M20 7h2"/> <path d="M7 20v2"/> <path d="M7 2v2"/> <rect x="4" y="4" width="16" height="16" rx="2"/> <rect x="8" y="8" width="8" height="8" rx="1"/>',
    "server": '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/> <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/> <line x1="6" x2="6.01" y1="6" y2="6"/> <line x1="6" x2="6.01" y1="18" y2="18"/>',
    "network": '<rect x="16" y="16" width="6" height="6" rx="1"/> <rect x="2" y="16" width="6" height="6" rx="1"/> <rect x="9" y="2" width="6" height="6" rx="1"/> <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/> <path d="M12 12V8"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/> <path d="M3 5V19A9 3 0 0 0 21 19V5"/> <path d="M3 12A9 3 0 0 0 21 12"/>',
    "code": '<path d="m16 18 6-6-6-6"/> <path d="m8 6-6 6 6 6"/>',
    "terminal": '<path d="M12 19h8"/> <path d="m4 17 6-6-6-6"/>',
    "git-branch": '<path d="M15 6a9 9 0 0 0-9 9V3"/> <circle cx="18" cy="6" r="3"/> <circle cx="6" cy="18" r="3"/>',
    "bot": '<path d="M12 8V4H8"/> <rect width="16" height="12" x="4" y="8" rx="2"/> <path d="M2 14h2"/> <path d="M20 14h2"/> <path d="M15 13v2"/> <path d="M9 13v2"/>',
    "binary": '<rect x="14" y="14" width="4" height="6" rx="2"/> <rect x="6" y="4" width="4" height="6" rx="2"/> <path d="M6 20h4"/> <path d="M14 10h4"/> <path d="M6 14h2v6"/> <path d="M14 4h2v6"/>',
    "chart-line": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/> <path d="m19 9-5 5-4-4-3 3"/>',
    "chart-column": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/> <path d="M18 17V9"/> <path d="M13 17V5"/> <path d="M8 17v-3"/>',
    "chart-pie": '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/> <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',
    "table": '<path d="M12 3v18"/> <rect width="18" height="18" x="3" y="3" rx="2"/> <path d="M3 9h18"/> <path d="M3 15h18"/>',
    "sigma": '<path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/>',
    "calculator": '<rect width="16" height="20" x="4" y="2" rx="2"/> <line x1="8" x2="16" y1="6" y2="6"/> <line x1="16" x2="16" y1="14" y2="18"/> <path d="M16 10h.01"/> <path d="M12 10h.01"/> <path d="M8 10h.01"/> <path d="M12 14h.01"/> <path d="M8 14h.01"/> <path d="M12 18h.01"/> <path d="M8 18h.01"/>',
    "infinity": '<path d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8"/>',
    "shapes": '<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/> <rect x="3" y="14" width="7" height="7" rx="1"/> <circle cx="17.5" cy="17.5" r="3.5"/>',
    "sparkles": '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/> <path d="M20 2v4"/> <path d="M22 4h-4"/> <circle cx="4" cy="20" r="2"/>',
    "layers": '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/> <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/> <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    "puzzle": '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>',
    "user": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/> <circle cx="12" cy="7" r="4"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <path d="M16 3.128a4 4 0 0 1 0 7.744"/> <path d="M22 21v-2a4 4 0 0 0-3-3.87"/> <circle cx="9" cy="7" r="4"/>',
    "building": '<path d="M12 10h.01"/> <path d="M12 14h.01"/> <path d="M12 6h.01"/> <path d="M16 10h.01"/> <path d="M16 14h.01"/> <path d="M16 6h.01"/> <path d="M8 10h.01"/> <path d="M8 14h.01"/> <path d="M8 6h.01"/> <path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/> <rect x="4" y="2" width="16" height="20" rx="2"/>',
    "landmark": '<path d="M10 18v-7"/> <path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/> <path d="M14 18v-7"/> <path d="M18 18v-7"/> <path d="M3 22h18"/> <path d="M6 18v-7"/>',
    "map-pin": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/> <circle cx="12" cy="10" r="3"/>',
    "hospital": '<path d="M12 7v4"/> <path d="M14 21v-3a2 2 0 0 0-4 0v3"/> <path d="M14 9h-4"/> <path d="M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/> <path d="M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/>',
    "stethoscope": '<path d="M11 2v2"/> <path d="M5 2v2"/> <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/> <path d="M8 15a6 6 0 0 0 12 0v-3"/> <circle cx="20" cy="10" r="2"/>',
    "scale": '<path d="M12 3v18"/> <path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/> <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/> <path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/> <path d="M7 21h10"/>',
    "languages": '<path d="m5 8 6 6"/> <path d="m4 14 6-6 2-3"/> <path d="M2 5h12"/> <path d="M7 2h1"/> <path d="m22 22-5-10-5 10"/> <path d="M14 18h6"/>',
    "briefcase": '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/> <rect width="20" height="14" x="2" y="6" rx="2"/>',
    "palette": '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/> <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/> <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/> <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/> <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
    "music": '<path d="M9 18V5l12-2v13"/> <circle cx="6" cy="18" r="3"/> <circle cx="18" cy="16" r="3"/>',
    "camera": '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/> <circle cx="12" cy="13" r="3"/>',
    "film": '<rect width="18" height="18" x="3" y="3" rx="2"/> <path d="M7 3v18"/> <path d="M3 7.5h4"/> <path d="M3 12h18"/> <path d="M3 16.5h4"/> <path d="M17 3v18"/> <path d="M17 7.5h4"/> <path d="M17 16.5h4"/>',
    "coffee": '<path d="M10 2v2"/> <path d="M14 2v2"/> <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/> <path d="M6 2v2"/>',
    "star": '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    "heart": '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
    "flag": '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
    "tag": '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/> <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    "pin": '<path d="M12 17v5"/> <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    "bell": '<path d="M10.268 21a2 2 0 0 0 3.464 0"/> <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    "clock": '<circle cx="12" cy="12" r="10"/> <path d="M12 6v6l4 2"/>',
    "hourglass": '<path d="M5 22h14"/> <path d="M5 2h14"/> <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/> <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    "calendar": '<path d="M8 2v3"/> <path d="M16 2v3"/> <rect x="3" y="3" width="18" height="18" rx="2"/> <path d="M3 9h18"/>',
    "target": '<circle cx="12" cy="12" r="10"/> <circle cx="12" cy="12" r="6"/> <circle cx="12" cy="12" r="2"/>',
    "trophy": '<path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/> <path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/> <path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/> <path d="M4 22h16"/> <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/> <path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/>',
    "award": '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/> <circle cx="12" cy="8" r="6"/>',
    "crown": '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/> <path d="M5 21h14"/>',
    "gem": '<path d="M10.5 3 8 9l4 13 4-13-2.5-6"/> <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z"/> <path d="M2 9h20"/>',
    "flame": '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
    "rocket": '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/> <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/> <path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/> <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/>',
    "lightbulb": '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/> <path d="M9 18h6"/> <path d="M10 22h4"/>',
    "key": '<path d="m2 21 9.6-9.6"/> <path d="m7.5 15.5 2.3 2.3a1 1 0 0 1 0 1.4l-2.1 2.1a1 1 0 0 1-1.4 0L4 19"/> <circle cx="15.5" cy="7.5" r="5.5"/>',
    "lock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/> <path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "shield": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    "eye": '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/> <circle cx="12" cy="12" r="3"/>',
    "link": '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    "paperclip": '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
    "circle-check": '<circle cx="12" cy="12" r="10"/> <path d="m16 9-5.5 5.5L8 12"/>',
    "circle-x": '<circle cx="12" cy="12" r="10"/> <path d="m15 9-6 6"/> <path d="m9 9 6 6"/>',
    "circle-alert": '<circle cx="12" cy="12" r="10"/> <line x1="12" x2="12" y1="8" y2="12"/> <line x1="12" x2="12.01" y1="16" y2="16"/>',
    "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/> <path d="M12 9v4"/> <path d="M12 17h.01"/>',
    "circle-help": '<circle cx="12" cy="12" r="10"/> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/> <path d="M12 17h.01"/>'
  });
  // Picker sections, in display order.
  const groups = Object.freeze([
    { id: "reading", icons: ["folder", "folder-open", "book-open", "book-marked", "bookmark", "library", "notebook", "notebook-pen", "file-text", "files", "newspaper", "scroll-text", "quote", "highlighter", "pencil", "sticky-note", "clipboard-list", "presentation", "graduation-cap", "school", "archive", "inbox"] },
    { id: "science", icons: ["flask-conical", "test-tube", "microscope", "telescope", "atom", "dna", "brain", "orbit", "magnet", "zap", "thermometer", "leaf", "sprout", "trees", "mountain", "waves", "sun", "moon", "cloud", "globe"] },
    { id: "data", icons: ["cpu", "server", "network", "database", "code", "terminal", "git-branch", "bot", "binary", "chart-line", "chart-column", "chart-pie", "table", "sigma", "calculator", "infinity", "shapes", "sparkles", "layers", "puzzle"] },
    { id: "people", icons: ["user", "users", "building", "landmark", "map-pin", "hospital", "stethoscope", "scale", "languages", "briefcase", "palette", "music", "camera", "film", "coffee"] },
    { id: "status", icons: ["star", "heart", "flag", "tag", "pin", "bell", "clock", "hourglass", "calendar", "target", "trophy", "award", "crown", "gem", "flame", "rocket", "lightbulb", "key", "lock", "shield", "eye", "link", "paperclip", "circle-check", "circle-x", "circle-alert", "triangle-alert", "circle-help"] }
  ]);
  // Tuned per theme mode for at least 3:1 against card, canvas and sidebar surfaces (see tests).
  const colors = Object.freeze({
    red: { light: "#d33a3a", dark: "#ff8a8a" },
    orange: { light: "#c3591d", dark: "#ffa36b" },
    yellow: { light: "#a06f00", dark: "#f0c24e" },
    lime: { light: "#4d7c0f", dark: "#a3e635" },
    green: { light: "#2a894b", dark: "#62d48c" },
    teal: { light: "#16808e", dark: "#5ccbd8" },
    cyan: { light: "#0e7490", dark: "#22d3ee" },
    sky: { light: "#0369a1", dark: "#38bdf8" },
    blue: { light: "#3866d6", dark: "#82a8ff" },
    indigo: { light: "#4f46e5", dark: "#a5b4fc" },
    purple: { light: "#7d47cc", dark: "#bc9cff" },
    fuchsia: { light: "#b0279f", dark: "#f09df0" },
    pink: { light: "#c63c74", dark: "#ff93c2" },
    brown: { light: "#8a5a3b", dark: "#d4a27f" },
    gray: { light: "#5f6470", dark: "#a8adb8" },
    ink: { light: "#3a3d48", dark: "#e2e4ea" }
  });
  const emoji = Object.freeze(["📚", "📖", "📝", "📌", "🔖", "🗂️", "🔬", "🧪", "🧠", "💻", "📊", "📈",
    "🧮", "🌍", "🎓", "💡", "🎯", "🚀", "⭐", "🔥", "❤️", "✅", "⏳", "🧩"]);
  const strings = {
    en: { menu: "Set Icon…", title: "Icon", emoji: "Emoji", emojiPlaceholder: "Type or paste an emoji",
      color: "Color", defaultColor: "Default", reset: "Restore default", note: "Saved on this computer only.",
      groups: { reading: "Reading & writing", science: "Science", data: "Data & tech", people: "People & places",
        status: "Status & marks" } },
    zh: { menu: "设置图标…", title: "图标", emoji: "Emoji", emojiPlaceholder: "输入或粘贴一个 emoji",
      color: "颜色", defaultColor: "默认", reset: "恢复默认图标", note: "图标设置只保存在这台电脑上。",
      groups: { reading: "阅读与写作", science: "科研", data: "数据与技术", people: "人与地点", status: "状态与标记" } }
  };
  const colorNames = {
    en: { red: "Red", orange: "Orange", yellow: "Yellow", lime: "Lime", green: "Green", teal: "Teal", cyan: "Cyan",
      sky: "Sky", blue: "Blue", indigo: "Indigo", purple: "Purple", fuchsia: "Fuchsia", pink: "Pink", brown: "Brown",
      gray: "Gray", ink: "Ink" },
    zh: { red: "红", orange: "橙", yellow: "黄", lime: "黄绿", green: "绿", teal: "青绿", cyan: "青", sky: "天蓝",
      blue: "蓝", indigo: "靛蓝", purple: "紫", fuchsia: "洋红", pink: "粉", brown: "棕", gray: "灰", ink: "墨" }
  };

  function firstGrapheme(text) {
    const value = String(text || "").trim();
    if (!value) return "";
    const segment = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value)[Symbol.iterator]().next();
    return segment.done ? "" : segment.value.segment;
  }
  // Returns a normalized entry, or null when nothing custom is left. Throws on invalid input.
  function validate(entry) {
    if (entry === null || entry === undefined) return null;
    if (typeof entry !== "object" || Array.isArray(entry)) throw new Error("Invalid icon entry");
    const result = {};
    if (entry.icon !== undefined && entry.icon !== null) {
      if (!Object.prototype.hasOwnProperty.call(icons, entry.icon)) throw new Error("Unknown icon");
      result.icon = entry.icon;
    }
    if (entry.emoji !== undefined && entry.emoji !== null && entry.emoji !== "") {
      const grapheme = firstGrapheme(entry.emoji);
      // A single emoji grapheme: no letters, digits, whitespace or ASCII punctuation.
      if (!grapheme || grapheme.length > 16 || /[\p{L}\p{N}\s\x00-\x7f]/u.test(grapheme)) throw new Error("Invalid emoji");
      result.emoji = grapheme;
    }
    if (result.icon && result.emoji) throw new Error("Choose either an icon or an emoji");
    if (entry.color !== undefined && entry.color !== null) {
      if (!Object.prototype.hasOwnProperty.call(colors, entry.color)) throw new Error("Unknown color");
      if (!result.icon) throw new Error("Colors apply to line icons only");
      result.color = entry.color;
    }
    return Object.keys(result).length ? result : null;
  }
  function maskURL(name) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" `
      + `stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  // Per-window rules: icon masks plus the color set for the active theme's light/dark mode.
  function css(mode) {
    const masks = Object.keys(icons).map(name =>
      `[data-mzt-icon="${name}"] { --mzt-icon-mask: ${maskURL(name)}; }`);
    const palette = Object.entries(colors).map(([name, value]) => `--mzt-icon-${name}: ${value[mode === "dark" ? "dark" : "light"]};`);
    return `:root[data-mzt-theme] { ${palette.join(" ")} }\n${masks.join("\n")}`;
  }

  // Picker panel anchored to a collection row; every click applies immediately through onChange.
  function openPicker({ win, anchor, current, locale, onChange }) {
    const doc = win.document;
    const t = strings[String(locale || "").startsWith("zh") ? "zh" : "en"];
    const names = colorNames[String(locale || "").startsWith("zh") ? "zh" : "en"];
    doc.getElementById("mzt-icon-picker")?.remove();
    const html = (tag, className, text) => {
      const node = doc.createElementNS("http://www.w3.org/1999/xhtml", tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    let state = current ? { ...current } : {};
    const panel = doc.createXULElement("panel");
    panel.id = "mzt-icon-picker";
    panel.setAttribute("type", "arrow");
    const root = html("div", "mzt-picker");
    const iconGrid = html("div", "mzt-picker-icons");
    const emojiGrid = html("div", "mzt-picker-grid");
    const colorRow = html("div", "mzt-picker-colors");
    const input = html("input", "mzt-picker-input");
    input.placeholder = t.emojiPlaceholder;
    const choose = next => {
      let entry;
      try { entry = validate(next); }
      catch (error) { input.setAttribute("aria-invalid", "true"); return; }
      input.removeAttribute("aria-invalid");
      state = entry || {};
      onChange(entry);
      render();
    };
    const iconButtons = [];
    for (const group of groups) {
      const grid = html("div", "mzt-picker-grid");
      for (const name of group.icons) {
        const button = html("button", "mzt-picker-option");
        button.type = "button";
        button.dataset.icon = name;
        button.title = name;
        const glyph = html("span", "mzt-picker-glyph");
        glyph.dataset.mztIcon = name;
        button.append(glyph);
        button.addEventListener("click", () => choose({ icon: name, color: state.icon ? state.color : undefined }));
        grid.append(button);
        iconButtons.push(button);
      }
      iconGrid.append(html("div", "mzt-picker-group", t.groups[group.id]), grid);
    }
    for (const character of emoji) {
      const button = html("button", "mzt-picker-option mzt-picker-emoji", character);
      button.type = "button";
      button.dataset.emoji = character;
      button.addEventListener("click", () => choose({ emoji: character }));
      emojiGrid.append(button);
    }
    input.addEventListener("change", () => input.value.trim() && choose({ emoji: input.value }));
    for (const name of [null, ...Object.keys(colors)]) {
      const swatch = html("button", "mzt-picker-swatch");
      swatch.type = "button";
      swatch.dataset.color = name || "default";
      swatch.title = name ? names[name] : t.defaultColor;
      if (name) swatch.style.setProperty("--mzt-swatch", `var(--mzt-icon-${name})`);
      swatch.addEventListener("click", () => state.icon && choose({ icon: state.icon, color: name }));
      colorRow.append(swatch);
    }
    const reset = html("button", "mzt-picker-reset", t.reset);
    reset.type = "button";
    reset.addEventListener("click", () => choose(null));
    root.append(html("div", "mzt-picker-label", t.title), iconGrid, html("div", "mzt-picker-label", t.color), colorRow,
      html("div", "mzt-picker-label", t.emoji), emojiGrid, input, html("div", "mzt-picker-footer"));
    root.lastChild.append(html("span", "mzt-picker-note", t.note), reset);
    function render() {
      for (const button of iconButtons) button.setAttribute("aria-pressed", String(button.dataset.icon === state.icon));
      for (const button of emojiGrid.children) button.setAttribute("aria-pressed", String(button.dataset.emoji === state.emoji));
      for (const swatch of colorRow.children) {
        swatch.setAttribute("aria-pressed", String(!!state.icon && (swatch.dataset.color === (state.color || "default"))));
        swatch.disabled = !state.icon;
      }
      root.style.setProperty("--mzt-picker-color", state.color ? `var(--mzt-icon-${state.color})` : "");
    }
    render();
    panel.append(root);
    panel.addEventListener("popuphidden", () => panel.remove(), { once: true });
    (doc.querySelector("popupset") || doc.documentElement).append(panel);
    panel.openPopup(anchor, "after_start", 0, 0, false, false);
    return panel;
  }

  const api = Object.freeze({ icons: Object.keys(icons), groups, colors, emoji, strings, validate, firstGrapheme, css, openPicker });
  scope.MZTCollectionIcons = api;
  if (typeof module !== "undefined") module.exports = api;
})(this);
