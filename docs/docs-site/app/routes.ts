import { type RouteConfig, route, layout } from '@react-router/dev/routes';

export default [
  // Layout wraps all routes
  layout('routes/_layout.tsx', [
    // English (default)
    route('/', 'routes/($locale).home.tsx', { id: 'home-en' }),
    route('/sound-blue', 'routes/($locale).sound-blue.tsx', { id: 'sound-blue-en' }),
    route('/tools', 'routes/($locale).tools.tsx', { id: 'tools-en' }),
    route('/dialogue', 'routes/($locale).dialogue.tsx', { id: 'dialogue-en' }),
    route('/about', 'routes/($locale).about.tsx', { id: 'about-en' }),

    // Korean
    route('/ko', 'routes/($locale).home.tsx', { id: 'home-ko' }),
    route('/ko/sound-blue', 'routes/($locale).sound-blue.tsx', { id: 'sound-blue-ko' }),
    route('/ko/tools', 'routes/($locale).tools.tsx', { id: 'tools-ko' }),
    route('/ko/dialogue', 'routes/($locale).dialogue.tsx', { id: 'dialogue-ko' }),
    route('/ko/about', 'routes/($locale).about.tsx', { id: 'about-ko' }),

    // Japanese
    route('/ja', 'routes/($locale).home.tsx', { id: 'home-ja' }),
    route('/ja/sound-blue', 'routes/($locale).sound-blue.tsx', { id: 'sound-blue-ja' }),
    route('/ja/tools', 'routes/($locale).tools.tsx', { id: 'tools-ja' }),
    route('/ja/dialogue', 'routes/($locale).dialogue.tsx', { id: 'dialogue-ja' }),
    route('/ja/about', 'routes/($locale).about.tsx', { id: 'about-ja' }),
  ]),
] satisfies RouteConfig;
