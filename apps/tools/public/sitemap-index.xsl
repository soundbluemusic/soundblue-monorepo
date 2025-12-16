<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="ko">
      <head>
        <title>Sitemap Index - Tools by SoundBlueMusic</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          :root {
            --bg: #0a0a0a;
            --card: #141414;
            --border: #262626;
            --text: #fafafa;
            --muted: #a1a1aa;
            --primary: #3b82f6;
            --main: #8b5cf6;
            --tools: #f59e0b;
            --legal: #6b7280;
          }
          @media (prefers-color-scheme: light) {
            :root {
              --bg: #fafafa;
              --card: #ffffff;
              --border: #e4e4e7;
              --text: #0a0a0a;
              --muted: #71717a;
            }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem 1rem;
          }
          .container { max-width: 1200px; margin: 0 auto; }
          .header {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
          .description { color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem; }
          .description a { color: var(--primary); text-decoration: none; }
          .description a:hover { text-decoration: underline; }
          .stats { font-size: 0.875rem; font-weight: 500; }
          .breadcrumb {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--muted);
            margin-bottom: 1.5rem;
          }
          .breadcrumb a { color: var(--muted); text-decoration: none; }
          .breadcrumb a:hover { color: var(--text); }
          .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }
          .sitemap-list { display: flex; flex-direction: column; gap: 0.75rem; }
          .sitemap-item {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1rem 1.25rem;
            transition: background 0.15s;
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .sitemap-item:hover { background: var(--border); }
          .sitemap-icon {
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            flex-shrink: 0;
          }
          .sitemap-icon.main { background: rgba(139, 92, 246, 0.15); }
          .sitemap-icon.tools { background: rgba(245, 158, 11, 0.15); }
          .sitemap-icon.legal { background: rgba(107, 114, 128, 0.15); }
          .sitemap-content { flex: 1; min-width: 0; }
          .sitemap-name {
            font-weight: 600;
            font-size: 0.9375rem;
            margin-bottom: 0.25rem;
          }
          .sitemap-link {
            color: var(--primary);
            text-decoration: none;
            font-size: 0.8125rem;
            word-break: break-all;
          }
          .sitemap-link:hover { text-decoration: underline; }
          .sitemap-meta {
            font-size: 0.75rem;
            color: var(--muted);
            margin-top: 0.25rem;
          }
          .badge {
            font-size: 0.6875rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-weight: 500;
            white-space: nowrap;
          }
          .badge.main { background: rgba(139, 92, 246, 0.15); color: var(--main); }
          .badge.tools { background: rgba(245, 158, 11, 0.15); color: var(--tools); }
          .badge.legal { background: rgba(107, 114, 128, 0.15); color: var(--legal); }
          .footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.75rem;
            color: var(--muted);
          }
          .footer a { color: var(--primary); text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sitemap Index</h1>
            <p class="description">
              XML Sitemap Index used by search engines like Google or Bing.
              More info at <a href="https://sitemaps.org" target="_blank" rel="noopener">sitemaps.org</a>.
            </p>
            <p class="stats">
              This sitemap index contains <strong><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/></strong> sitemaps.
            </p>
          </div>

          <nav class="breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <span>Sitemap Index</span>
          </nav>

          <div class="section-title">Sitemaps</div>

          <div class="sitemap-list">
            <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
              <xsl:variable name="loc" select="sitemap:loc"/>
              <div class="sitemap-item">
                <xsl:choose>
                  <xsl:when test="contains($loc, 'sitemap-main')">
                    <div class="sitemap-icon main">🏠</div>
                    <div class="sitemap-content">
                      <div class="sitemap-name">Main Pages <span class="badge main">HOME</span></div>
                      <a class="sitemap-link" href="{$loc}"><xsl:value-of select="$loc"/></a>
                      <xsl:if test="sitemap:lastmod">
                        <div class="sitemap-meta">Last modified: <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></div>
                      </xsl:if>
                    </div>
                  </xsl:when>
                  <xsl:when test="contains($loc, 'sitemap-tools')">
                    <div class="sitemap-icon tools">🛠️</div>
                    <div class="sitemap-content">
                      <div class="sitemap-name">Tools <span class="badge tools">TOOLS</span></div>
                      <a class="sitemap-link" href="{$loc}"><xsl:value-of select="$loc"/></a>
                      <xsl:if test="sitemap:lastmod">
                        <div class="sitemap-meta">Last modified: <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></div>
                      </xsl:if>
                    </div>
                  </xsl:when>
                  <xsl:when test="contains($loc, 'sitemap-legal')">
                    <div class="sitemap-icon legal">⚖️</div>
                    <div class="sitemap-content">
                      <div class="sitemap-name">Legal Pages <span class="badge legal">LEGAL</span></div>
                      <a class="sitemap-link" href="{$loc}"><xsl:value-of select="$loc"/></a>
                      <xsl:if test="sitemap:lastmod">
                        <div class="sitemap-meta">Last modified: <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></div>
                      </xsl:if>
                    </div>
                  </xsl:when>
                  <xsl:otherwise>
                    <div class="sitemap-icon">📄</div>
                    <div class="sitemap-content">
                      <div class="sitemap-name">Sitemap</div>
                      <a class="sitemap-link" href="{$loc}"><xsl:value-of select="$loc"/></a>
                      <xsl:if test="sitemap:lastmod">
                        <div class="sitemap-meta">Last modified: <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></div>
                      </xsl:if>
                    </div>
                  </xsl:otherwise>
                </xsl:choose>
              </div>
            </xsl:for-each>
          </div>

          <div class="footer">
            <p>Generated by <a href="https://tools.soundbluemusic.com">Tools by SoundBlueMusic</a></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
