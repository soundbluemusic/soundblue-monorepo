<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <!-- Sitemap Index Template -->
  <xsl:template match="sitemap:sitemapindex">
    <html>
      <head>
        <title>Sitemap Index - Sound Blue</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root {
            --bg-primary: #faf9f7;
            --bg-secondary: #ffffff;
            --text-primary: #1c1917;
            --text-secondary: #57534e;
            --text-tertiary: #a8a29e;
            --border-color: #e7e5e4;
            --accent-color: #3b82f6;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-primary: #0c0a09;
              --bg-secondary: #1c1917;
              --text-primary: #fafaf9;
              --text-secondary: #a8a29e;
              --text-tertiary: #78716c;
              --border-color: #292524;
              --accent-color: #60a5fa;
            }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            padding: 2rem;
          }
          .container { max-width: 900px; margin: 0 auto; }
          header {
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
          }
          h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; }
          .subtitle { color: var(--text-secondary); font-size: 0.875rem; }
          .subtitle a { color: var(--accent-color); text-decoration: none; }
          .subtitle a:hover { text-decoration: underline; }
          .info {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.875rem 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
          }
          .info a { color: var(--accent-color); text-decoration: none; }
          .info a:hover { text-decoration: underline; }
          .section-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-color);
          }
          .sitemap-list {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
          }
          .sitemap-item {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .sitemap-item:last-child { border-bottom: none; }
          .sitemap-item:hover { background: var(--bg-primary); }
          .sitemap-item a {
            color: var(--accent-color);
            text-decoration: none;
            font-size: 0.875rem;
            word-break: break-all;
          }
          .sitemap-item a:hover { text-decoration: underline; }
          .sitemap-meta {
            font-size: 0.75rem;
            color: var(--text-tertiary);
            white-space: nowrap;
            margin-left: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Sitemap Index</h1>
            <p class="subtitle">
              XML Sitemap for <a href="https://soundbluemusic.com">Sound Blue</a>
            </p>
          </header>

          <div class="info">
            This sitemap index contains <strong><xsl:value-of select="count(sitemap:sitemap)"/></strong> sitemap(s).
            Learn more at <a href="https://sitemaps.org" target="_blank" rel="noopener">sitemaps.org</a>.
          </div>

          <div class="section-title">Sitemaps</div>
          <div class="sitemap-list">
            <xsl:for-each select="sitemap:sitemap">
              <div class="sitemap-item">
                <a href="{sitemap:loc}">
                  <xsl:value-of select="sitemap:loc"/>
                </a>
                <span class="sitemap-meta">
                  <xsl:if test="sitemap:lastmod">
                    <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                  </xsl:if>
                </span>
              </div>
            </xsl:for-each>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- URL Set Template -->
  <xsl:template match="sitemap:urlset">
    <html>
      <head>
        <title>Sitemap - Sound Blue</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root {
            --bg-primary: #faf9f7;
            --bg-secondary: #ffffff;
            --text-primary: #1c1917;
            --text-secondary: #57534e;
            --text-tertiary: #a8a29e;
            --border-color: #e7e5e4;
            --accent-color: #3b82f6;
            --lang-en: #10b981;
            --lang-ko: #f59e0b;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-primary: #0c0a09;
              --bg-secondary: #1c1917;
              --text-primary: #fafaf9;
              --text-secondary: #a8a29e;
              --text-tertiary: #78716c;
              --border-color: #292524;
              --accent-color: #60a5fa;
              --lang-en: #34d399;
              --lang-ko: #fbbf24;
            }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            padding: 2rem;
          }
          .container { max-width: 900px; margin: 0 auto; }
          header {
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
          }
          h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; }
          .subtitle { color: var(--text-secondary); font-size: 0.875rem; }
          .subtitle a { color: var(--accent-color); text-decoration: none; }
          .subtitle a:hover { text-decoration: underline; }
          .breadcrumb {
            font-size: 0.8125rem;
            color: var(--text-tertiary);
            margin-bottom: 1rem;
          }
          .breadcrumb a { color: var(--text-secondary); text-decoration: none; }
          .breadcrumb a:hover { color: var(--accent-color); }
          .breadcrumb span { margin: 0 0.375rem; }
          .info {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.875rem 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
          }
          .info a { color: var(--accent-color); text-decoration: none; }
          .info a:hover { text-decoration: underline; }
          .section-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
          }
          .url-list {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
          }
          .url-group {
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
          }
          .url-group:first-child { padding-top: 0; }
          .url-group:last-child { border-bottom: none; padding-bottom: 0; }
          .url-item {
            display: flex;
            align-items: center;
            padding: 0.25rem 0;
            font-size: 0.875rem;
          }
          .url-item a {
            color: var(--accent-color);
            text-decoration: none;
            word-break: break-all;
          }
          .url-item a:hover { text-decoration: underline; }
          .lang-arrow {
            color: var(--text-tertiary);
            margin: 0 0.5rem;
            font-size: 0.75rem;
          }
          .lang-tag {
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: lowercase;
          }
          .lang-en { color: var(--lang-en); }
          .lang-ko { color: var(--lang-ko); }
          @media (max-width: 640px) {
            body { padding: 1rem; }
            .url-item { flex-wrap: wrap; }
            .url-item a { width: 100%; margin-bottom: 0.25rem; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Sitemap</h1>
            <p class="subtitle">
              XML Sitemap for <a href="https://soundbluemusic.com">Sound Blue</a>
            </p>
          </header>

          <div class="breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <strong>Sitemap</strong>
          </div>

          <div class="info">
            This sitemap contains <strong><xsl:value-of select="count(sitemap:url)"/></strong> URL(s) with multilingual support (English &amp; Korean).
            Learn more at <a href="https://sitemaps.org" target="_blank" rel="noopener">sitemaps.org</a>.
          </div>

          <div class="section-title">URL</div>
          <div class="url-list">
            <xsl:for-each select="sitemap:url">
              <div class="url-group">
                <!-- Main URL -->
                <div class="url-item">
                  <a href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                  <span class="lang-arrow">→</span>
                  <span class="lang-tag lang-en">en</span>
                </div>
                <!-- Alternate language URLs -->
                <xsl:for-each select="xhtml:link[@hreflang='ko']">
                  <div class="url-item">
                    <a href="{@href}">
                      <xsl:value-of select="@href"/>
                    </a>
                    <span class="lang-arrow">→</span>
                    <span class="lang-tag lang-ko">ko</span>
                  </div>
                </xsl:for-each>
              </div>
            </xsl:for-each>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
