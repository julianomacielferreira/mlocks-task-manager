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
import * as fs from 'fs';
import * as path from 'path';

const docsDir = path.resolve(__dirname, '../docs');

const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.json'));

const merged: any = {
    openapi: '3.0.0',
    info: { title: 'Combined API', version: '1.0' },
    paths: {},
    components: { schemas: {}, responses: {}, parameters: {}, securitySchemes: {} },
    tags: [],
};

for (const file of files) {

    const doc = JSON.parse(fs.readFileSync(path.join(docsDir, file), 'utf8'));

    // merge paths (careful about collisions)
    Object.assign(merged.paths, doc.paths || {});

    // merge components.schemas (simple copy; consider prefixing to avoid name collisions)
    if (doc.components?.schemas) {
        for (const [k, v] of Object.entries(doc.components.schemas)) {
            // optional: prefix schema names with service name to avoid conflicts
            merged.components.schemas[k] = v;
        }
    }

    // merge securitySchemes, responses, parameters similarly...
    if (doc.components?.securitySchemes) {
        for (const [k, v] of Object.entries(doc.components.securitySchemes)) {
            merged.components.securitySchemes[k] = v;
        }
    }

    if (doc.components?.responses) {
        for (const [k, v] of Object.entries(doc.components.responses)) {
            merged.components.responses[k] = v;
        }
    }

    if (doc.components?.parameters) {
        for (const [k, v] of Object.entries(doc.components.parameters)) {
            merged.components.parameters[k] = v;
        }
    }

    if (doc.tags) merged.tags.push(...doc.tags);
}

fs.writeFileSync(path.join(docsDir, 'combined.json'), JSON.stringify(merged, null, 2));
console.log('Wrote docs/combined.json');