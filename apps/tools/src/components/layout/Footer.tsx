/**
 * @fileoverview Footer component for Tools app
 *
 * Uses shared AppFooter with cross-app navigation and social links.
 */

import { useParaglideI18n } from '@soundblue/i18n';
import { AppFooter } from '@soundblue/ui-components/composite/navigation';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const { locale } = useParaglideI18n();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';

  return (
    <AppFooter
      currentApp="tools"
      locale={currentLocale}
      brandName="SoundBlueMusic"
      className={className}
    />
  );
}
