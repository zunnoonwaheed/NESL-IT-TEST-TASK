import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { config } from '../../config';
import { ShapeNode, ShapeType, CircleNode, RectangleNode } from '../../shared/types';
import { CANVAS_CONFIG, NODE_COLORS } from '../../shared/constants';

interface RawNode {
  id?: string;
  type?: string;
  x?: number;
  y?: number;
  radius?: number;
  width?: number;
  height?: number;
  label?: string;
  color?: string;
}

interface RawResponse {
  nodes?: RawNode[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: config.groqApiKey });
  }

  async generateNodes(prompt: string): Promise<ShapeNode[]> {
    try {
      const raw = await this.callGroq(prompt);
      const parsed = this.parseResponse(raw);
      return this.validateAndSanitize(parsed, prompt);
    } catch (err) {
      this.logger.error('AI generation failed, using fallback', err);
      return this.deterministicFallback(prompt);
    }
  }

  private async callGroq(prompt: string): Promise<string> {
    const systemPrompt = `You are an intelligent canvas layout generator for a ${CANVAS_CONFIG.WIDTH}x${CANVAS_CONFIG.HEIGHT}px canvas (center: 500, 350).

UNDERSTAND & CREATE THESE PATTERNS:

**Geometric Shapes** (triangle, square, pentagon, hexagon, octagon, etc.):
- Arrange N nodes in the shape of that polygon
- Triangle = 3 nodes, Pentagon = 5, Hexagon = 6, Octagon = 8, etc.
- Space evenly in a circular pattern around center
- Use appropriate radius (~180px) to fit canvas

**Star/Hub Pattern** ("star", "hub", "spoke"):
- One larger center node + surrounding nodes in circle around it
- Center node should be bigger (radius ~45px)

**Grid Pattern** ("grid", "3x4", "rows", "columns"):
- Arrange nodes in evenly-spaced rows and columns
- Parse numbers from prompt (e.g., "3x4" = 3 rows × 4 columns)
- Distribute evenly across canvas with margins

**Line Patterns** ("row", "line", "column"):
- Row: horizontal line of nodes
- Column: vertical line of nodes
- Space evenly along the line

**General Rules:**
- Canvas bounds: x: 80-920, y: 80-620 (stay within safe area)
- Max ${CANVAS_CONFIG.MAX_SHAPES} nodes total
- Shape types: "circle" (default) or "rectangle" (if user asks)
- Circle radius: 30-40px, Rectangle: ~100x60px
- Labels: max 2 characters (A, B, C... or from prompt)
- Calculate positions mathematically to create proper geometric patterns

**JSON Response Format:**
{
  "nodes": [
    { "id": "node-1", "type": "circle", "x": 500, "y": 170, "radius": 35, "label": "A" }
  ]
}

Return ONLY the JSON object, nothing else.`;

    const completion = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${prompt}\n\nRespond with ONLY the JSON object, no other text.` }
      ],
      temperature: 0.2, // Very low for precise, consistent outputs
      max_tokens: 2048,
      response_format: { type: 'json_object' }, // Force JSON mode
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Groq AI');
    }
    return content;
  }

  private parseResponse(raw: string): RawResponse {
    let cleaned = raw.trim();
    // Strip markdown fences and any extra text
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    cleaned = cleaned.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

    // Extract the JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      this.logger.warn('No JSON found in response:', raw);
      throw new Error('No JSON found in response');
    }

    try {
      return JSON.parse(jsonMatch[0]) as RawResponse;
    } catch (error) {
      this.logger.error('Failed to parse JSON:', jsonMatch[0]);
      this.logger.error('Parse error:', error);
      throw error;
    }
  }

  private validateAndSanitize(data: RawResponse, _prompt: string): ShapeNode[] {
    if (!data?.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid response structure');
    }

    const nodes: ShapeNode[] = [];

    for (let i = 0; i < Math.min(data.nodes.length, CANVAS_CONFIG.MAX_SHAPES); i++) {
      const raw = data.nodes[i];
      const sanitized = this.sanitizeNode(raw, i);
      if (sanitized) nodes.push(sanitized);
    }

    if (nodes.length === 0) throw new Error('No valid nodes generated');
    return nodes;
  }

  private sanitizeNode(raw: RawNode, index: number): ShapeNode | null {
    if (!raw || typeof raw !== 'object') return null;

    const type = raw.type === ShapeType.Rectangle ? ShapeType.Rectangle : ShapeType.Circle;
    const label = String(raw.label ?? String.fromCharCode(65 + index)).slice(0, CANVAS_CONFIG.MAX_LABEL_LENGTH);
    const color = NODE_COLORS[index % NODE_COLORS.length];

    const x = this.clamp(Number(raw.x) || 200, 80, CANVAS_CONFIG.WIDTH - 80);
    const y = this.clamp(Number(raw.y) || 200, 80, CANVAS_CONFIG.HEIGHT - 80);

    const id = String(raw.id ?? `node-${index + 1}`);

    if (type === ShapeType.Circle) {
      const radius = this.clamp(Number(raw.radius) || CANVAS_CONFIG.DEFAULT_CIRCLE_RADIUS, 15, 80);
      return { id, type, x, y, radius, label, color } satisfies CircleNode;
    } else {
      const width = this.clamp(Number(raw.width) || CANVAS_CONFIG.DEFAULT_RECT_WIDTH, 40, 200);
      const height = this.clamp(Number(raw.height) || CANVAS_CONFIG.DEFAULT_RECT_HEIGHT, 30, 120);
      return { id, type, x, y, width, height, label, color } satisfies RectangleNode;
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private deterministicFallback(prompt: string): ShapeNode[] {
    const lower = prompt.toLowerCase();

    // Detect shape type
    const hasRectangle = /rectangle|rect|square|box/i.test(lower);
    const hasCircle = /circle|round/i.test(lower);

    // Detect layout pattern
    if (/grid/i.test(lower)) {
      return this.createGrid(prompt);
    } else if (/row|line|horizontal/i.test(lower)) {
      return this.createRow(prompt, hasRectangle);
    } else if (/column|vertical/i.test(lower)) {
      return this.createColumn(prompt, hasRectangle);
    } else if (/star|radial/i.test(lower)) {
      return this.createStar(prompt);
    } else if (/hexagon|hex/i.test(lower)) {
      return this.createHexagon(prompt);
    } else if (/ring|concentric/i.test(lower)) {
      return this.createConcentricRings(prompt);
    } else {
      // Default circular layout
      return this.createCircular(prompt, hasRectangle);
    }
  }

  private createGrid(prompt: string): ShapeNode[] {
    const match = prompt.match(/(\d+)\s*x\s*(\d+)/i);
    let rows = 3, cols = 4;

    if (match) {
      rows = Math.min(parseInt(match[1], 10), 4);
      cols = Math.min(parseInt(match[2], 10), 4);
    } else {
      const count = this.extractCount(prompt);
      if (count) {
        rows = Math.ceil(Math.sqrt(count));
        cols = Math.ceil(count / rows);
      }
    }

    const total = Math.min(rows * cols, CANVAS_CONFIG.MAX_SHAPES);
    const nodes: ShapeNode[] = [];
    const marginX = 120;
    const marginY = 100;
    const spacingX = (CANVAS_CONFIG.WIDTH - 2 * marginX) / (cols - 1 || 1);
    const spacingY = (CANVAS_CONFIG.HEIGHT - 2 * marginY) / (rows - 1 || 1);

    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = cols === 1 ? CANVAS_CONFIG.WIDTH / 2 : marginX + col * spacingX;
      const y = rows === 1 ? CANVAS_CONFIG.HEIGHT / 2 : marginY + row * spacingY;

      nodes.push({
        id: `node-${i + 1}`,
        type: ShapeType.Circle,
        x: Math.round(x),
        y: Math.round(y),
        radius: 30,
        label: String.fromCharCode(65 + i),
        color: NODE_COLORS[i % NODE_COLORS.length],
      } satisfies CircleNode);
    }

    return nodes;
  }

  private createRow(prompt: string, useRectangles: boolean): ShapeNode[] {
    const count = Math.min(this.extractCount(prompt) ?? 4, CANVAS_CONFIG.MAX_SHAPES);
    const nodes: ShapeNode[] = [];
    const margin = 120;
    const spacing = (CANVAS_CONFIG.WIDTH - 2 * margin) / (count - 1 || 1);
    const y = CANVAS_CONFIG.HEIGHT / 2;

    for (let i = 0; i < count; i++) {
      const x = count === 1 ? CANVAS_CONFIG.WIDTH / 2 : margin + i * spacing;

      if (useRectangles) {
        nodes.push({
          id: `node-${i + 1}`,
          type: ShapeType.Rectangle,
          x: Math.round(x),
          y: Math.round(y),
          width: 100,
          height: 60,
          label: String.fromCharCode(65 + i),
          color: NODE_COLORS[i % NODE_COLORS.length],
        } satisfies RectangleNode);
      } else {
        nodes.push({
          id: `node-${i + 1}`,
          type: ShapeType.Circle,
          x: Math.round(x),
          y: Math.round(y),
          radius: 35,
          label: String.fromCharCode(65 + i),
          color: NODE_COLORS[i % NODE_COLORS.length],
        } satisfies CircleNode);
      }
    }

    // Handle "above center" pattern
    if (/above.*center|center.*above/i.test(prompt)) {
      nodes.push({
        id: `node-${nodes.length + 1}`,
        type: ShapeType.Circle,
        x: CANVAS_CONFIG.WIDTH / 2,
        y: y - 120,
        radius: 35,
        label: String.fromCharCode(65 + nodes.length),
        color: NODE_COLORS[nodes.length % NODE_COLORS.length],
      } satisfies CircleNode);
    }

    return nodes;
  }

  private createColumn(prompt: string, useRectangles: boolean): ShapeNode[] {
    const count = Math.min(this.extractCount(prompt) ?? 4, CANVAS_CONFIG.MAX_SHAPES);
    const nodes: ShapeNode[] = [];
    const margin = 100;
    const spacing = (CANVAS_CONFIG.HEIGHT - 2 * margin) / (count - 1 || 1);
    const x = CANVAS_CONFIG.WIDTH / 2;

    for (let i = 0; i < count; i++) {
      const y = count === 1 ? CANVAS_CONFIG.HEIGHT / 2 : margin + i * spacing;

      if (useRectangles) {
        nodes.push({
          id: `node-${i + 1}`,
          type: ShapeType.Rectangle,
          x: Math.round(x),
          y: Math.round(y),
          width: 100,
          height: 60,
          label: String.fromCharCode(65 + i),
          color: NODE_COLORS[i % NODE_COLORS.length],
        } satisfies RectangleNode);
      } else {
        nodes.push({
          id: `node-${i + 1}`,
          type: ShapeType.Circle,
          x: Math.round(x),
          y: Math.round(y),
          radius: 35,
          label: String.fromCharCode(65 + i),
          color: NODE_COLORS[i % NODE_COLORS.length],
        } satisfies CircleNode);
      }
    }

    return nodes;
  }

  private createStar(prompt: string): ShapeNode[] {
    const surroundingCount = Math.min(this.extractCount(prompt) ?? 6, CANVAS_CONFIG.MAX_SHAPES - 1);
    const nodes: ShapeNode[] = [];
    const cx = CANVAS_CONFIG.WIDTH / 2;
    const cy = CANVAS_CONFIG.HEIGHT / 2;
    const radius = 180;

    // Center node
    nodes.push({
      id: 'node-1',
      type: ShapeType.Circle,
      x: cx,
      y: cy,
      radius: 45,
      label: 'C',
      color: NODE_COLORS[0],
    } satisfies CircleNode);

    // Surrounding nodes
    for (let i = 0; i < surroundingCount; i++) {
      const angle = (2 * Math.PI * i) / surroundingCount - Math.PI / 2;
      const x = Math.round(cx + radius * Math.cos(angle));
      const y = Math.round(cy + radius * Math.sin(angle));

      nodes.push({
        id: `node-${i + 2}`,
        type: ShapeType.Circle,
        x,
        y,
        radius: 30,
        label: String.fromCharCode(65 + i),
        color: NODE_COLORS[(i + 1) % NODE_COLORS.length],
      } satisfies CircleNode);
    }

    return nodes;
  }

  private createHexagon(prompt: string): ShapeNode[] {
    const count = Math.min(this.extractCount(prompt) ?? 6, CANVAS_CONFIG.MAX_SHAPES);
    const nodes: ShapeNode[] = [];
    const cx = CANVAS_CONFIG.WIDTH / 2;
    const cy = CANVAS_CONFIG.HEIGHT / 2;
    const radius = 180;

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const x = Math.round(cx + radius * Math.cos(angle));
      const y = Math.round(cy + radius * Math.sin(angle));

      nodes.push({
        id: `node-${i + 1}`,
        type: ShapeType.Circle,
        x,
        y,
        radius: 35,
        label: String.fromCharCode(65 + i),
        color: NODE_COLORS[i % NODE_COLORS.length],
      } satisfies CircleNode);
    }

    return nodes;
  }

  private createConcentricRings(prompt: string): ShapeNode[] {
    const nodes: ShapeNode[] = [];
    const cx = CANVAS_CONFIG.WIDTH / 2;
    const cy = CANVAS_CONFIG.HEIGHT / 2;

    // Parse ring counts (e.g., "1 center, 4 middle, 7 outer")
    const centerMatch = /(\d+)\s*center/i.exec(prompt);
    const middleMatch = /(\d+)\s*middle/i.exec(prompt);
    const outerMatch = /(\d+)\s*outer/i.exec(prompt);

    const centerCount = centerMatch ? parseInt(centerMatch[1], 10) : 1;
    const middleCount = middleMatch ? parseInt(middleMatch[1], 10) : 4;
    const outerCount = outerMatch ? parseInt(outerMatch[1], 10) : 7;

    // Center
    if (centerCount > 0) {
      nodes.push({
        id: 'node-1',
        type: ShapeType.Circle,
        x: cx,
        y: cy,
        radius: 35,
        label: '0',
        color: NODE_COLORS[0],
      } satisfies CircleNode);
    }

    // Middle ring
    for (let i = 0; i < middleCount && nodes.length < CANVAS_CONFIG.MAX_SHAPES; i++) {
      const angle = (2 * Math.PI * i) / middleCount;
      const x = Math.round(cx + 100 * Math.cos(angle));
      const y = Math.round(cy + 100 * Math.sin(angle));

      nodes.push({
        id: `node-${nodes.length + 1}`,
        type: ShapeType.Circle,
        x,
        y,
        radius: 25,
        label: String(i + 1),
        color: NODE_COLORS[nodes.length % NODE_COLORS.length],
      } satisfies CircleNode);
    }

    // Outer ring
    for (let i = 0; i < outerCount && nodes.length < CANVAS_CONFIG.MAX_SHAPES; i++) {
      const angle = (2 * Math.PI * i) / outerCount;
      const x = Math.round(cx + 200 * Math.cos(angle));
      const y = Math.round(cy + 200 * Math.sin(angle));

      nodes.push({
        id: `node-${nodes.length + 1}`,
        type: ShapeType.Circle,
        x,
        y,
        radius: 25,
        label: String(i + 1 + middleCount),
        color: NODE_COLORS[nodes.length % NODE_COLORS.length],
      } satisfies CircleNode);
    }

    return nodes;
  }

  private createCircular(prompt: string, useRectangles: boolean): ShapeNode[] {
    const count = Math.min(this.extractCount(prompt) ?? 5, CANVAS_CONFIG.MAX_SHAPES);
    const nodes: ShapeNode[] = [];
    const cx = CANVAS_CONFIG.WIDTH / 2;
    const cy = CANVAS_CONFIG.HEIGHT / 2;
    const radius = 180;

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      const x = i === 0 ? cx : Math.round(cx + radius * Math.cos(angle));
      const y = i === 0 ? cy : Math.round(cy + radius * Math.sin(angle));

      if (useRectangles) {
        nodes.push({
          id: `node-${i + 1}`,
          type: ShapeType.Rectangle,
          x,
          y,
          width: i === 0 ? 120 : 100,
          height: i === 0 ? 70 : 60,
          label: String.fromCharCode(65 + i),
          color: NODE_COLORS[i % NODE_COLORS.length],
        } satisfies RectangleNode);
      } else {
        nodes.push({
          id: `node-${i + 1}`,
          type: ShapeType.Circle,
          x,
          y,
          radius: i === 0 ? 45 : 30,
          label: String.fromCharCode(65 + i),
          color: NODE_COLORS[i % NODE_COLORS.length],
        } satisfies CircleNode);
      }
    }

    return nodes;
  }

  private extractCount(prompt: string): number | null {
    const match = prompt.match(/\b(\d+)\b/);
    return match ? parseInt(match[1], 10) : null;
  }
}
