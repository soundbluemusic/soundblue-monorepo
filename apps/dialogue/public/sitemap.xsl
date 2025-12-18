<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <title>
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">Sitemap Index - Dialogue</xsl:when>
            <xsl:otherwise>Sitemap - Dialogue</xsl:otherwise>
          </xsl:choose>
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          :root {
            --bg: #ffffff;
            --text: #1a1a1a;
            --text-muted: #666666;
            --border: #e5e5e5;
            --link: #2563eb;
            --link-hover: #1d4ed8;
            --en-badge: #22c55e;
            --ko-badge: #eab308;
            --header-bg: #f8fafc;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0f172a;
              --text: #f1f5f9;
              --text-muted: #94a3b8;
              --border: #334155;
              --link: #60a5fa;
              --link-hover: #93c5fd;
              --header-bg: #1e293b;
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

          .container { max-width: 1000px; margin: 0 auto; }

          h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }

          .subtitle {
            color: var(--text-muted);
            margin-bottom: 2rem;
            font-size: 0.875rem;
          }

          table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }

          th {
            text-align: left;
            padding: 0.75rem 1rem;
            background: var(--header-bg);
            border-bottom: 2px solid var(--border);
            font-weight: 600;
          }

          td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
          }

          tr:hover td { background: var(--header-bg); }

          a { color: var(--link); text-decoration: none; word-break: break-all; }
          a:hover { color: var(--link-hover); text-decoration: underline; }

          .badge {
            display: inline-block;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-right: 0.5rem;
          }

          .badge-en { background: var(--en-badge); color: white; }
          .badge-ko { background: var(--ko-badge); color: #1a1a1a; }

          .stats {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--header-bg);
            border-radius: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-muted);
          }

          @media (max-width: 640px) {
            body { padding: 1rem 0.5rem; }
            th, td { padding: 0.5rem; }
            .hide-mobile { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">
              <xsl:call-template name="sitemapindex" />
            </xsl:when>
            <xsl:otherwise>
              <xsl:call-template name="urlset" />
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- Sitemap Index Template -->
  <xsl:template name="sitemapindex">
    <h1>Sitemap Index</h1>
    <p class="subtitle">dialogue.soundbluemusic.com</p>

    <table>
      <thead>
        <tr>
          <th>Sitemap</th>
          <th class="hide-mobile">Last Modified</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
          <tr>
            <td>
              <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc" /></a>
            </td>
            <td class="hide-mobile"><xsl:value-of select="sitemap:lastmod" /></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>

    <div class="stats">
      Total: <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)" /> sitemaps
    </div>
  </xsl:template>

  <!-- URL Set Template -->
  <xsl:template name="urlset">
    <h1>Sitemap</h1>
    <p class="subtitle">dialogue.soundbluemusic.com</p>

    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th class="hide-mobile">Priority</th>
          <th class="hide-mobile">Freq</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="sitemap:urlset/sitemap:url">
          <tr>
            <td>
              <xsl:choose>
                <xsl:when test="contains(sitemap:loc, '/ko')">
                  <span class="badge badge-ko">KO</span>
                </xsl:when>
                <xsl:otherwise>
                  <span class="badge badge-en">EN</span>
                </xsl:otherwise>
              </xsl:choose>
              <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc" /></a>
            </td>
            <td class="hide-mobile"><xsl:value-of select="sitemap:priority" /></td>
            <td class="hide-mobile"><xsl:value-of select="sitemap:changefreq" /></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>

    <div class="stats">
      Total: <xsl:value-of select="count(sitemap:urlset/sitemap:url)" /> URLs
    </div>
  </xsl:template>

</xsl:stylesheet>