/*
 * The MIT License
 *
 * Copyright 2026 Juliano Maciel.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

const app = (express as any)();

const docsDir = path.resolve(__dirname, '../../docs');

const combinedPath = path.join(docsDir, 'combined.json');

app.use('/docs', express.static(docsDir));

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, { swaggerUrl: '/docs/combined.json' }),
);

app.get('/', (_req, res) => res.redirect('/api-docs'));

const port = process.env.PORT || 3004;

app.listen(port, () => {

    console.log(`Docs available: http://localhost:${port}/api-docs`);

    if (!fs.existsSync(combinedPath)) {
        console.warn(`Warning: ${combinedPath} not found — run docs:generate first.`);
    }
});

export { };
