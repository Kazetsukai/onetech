"use strict";

const sm = require('sitemap');
const fs = require('fs');

const ObjectFilters = require('./ObjectFilters');

class SitemapGenerator {
  constructor(rootDir) {
    this.rootDir = rootDir;
  }

  generate(objects) {
    const sitemap = sm.createSitemap({hostname: 'https://kazetsukai.github.io/onetech', cacheTime: 600000});

    sitemap.add({url: "/"});

    for (let filter of ObjectFilters.filters) {
      sitemap.add({url: `/filters/${filter.key}`});
    }

    for (let object of objects) {
      const path = encodeURIComponent(`${object.id}-${object.name.replace(/[\s-]+/g, '-')}`);
      sitemap.add({url: `/${path}`});
      sitemap.add({url: `/${path}/tech-tree`});
      sitemap.add({url: `/${path}/recipe`});
    }

    fs.writeFileSync(this.rootDir + "sitemap.xml", sitemap.toString());
  }
}

module.exports = SitemapGenerator;
