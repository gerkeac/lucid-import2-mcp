import {
  DocumentDefinition,
  PageDefinition,
  ShapeDefinition,
  LineDefinition,
  BoundingBox,
  Style,
} from './types.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Builder class for creating Lucid Standard Import JSON documents
 */
export class LucidDocumentBuilder {
  private document: DocumentDefinition;
  private currentPage: PageDefinition | null = null;

  constructor() {
    this.document = {
      version: '1.0',
      pages: [],
    };
  }

  /**
   * Add a new page to the document
   */
  addPage(title: string): this {
    const page: PageDefinition = {
      id: uuidv4(),
      title,
      shapes: [],
      lines: [],
    };
    this.document.pages.push(page);
    this.currentPage = page;
    return this;
  }

  /**
   * Add a shape to the current page
   */
  addShape(params: {
    shapeType: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
    style?: Style;
    rotation?: number;
    customData?: Record<string, unknown>;
  }): string {
    if (!this.currentPage) {
      throw new Error('No page available. Call addPage() first.');
    }

    const id = uuidv4();
    const shape: ShapeDefinition = {
      id,
      shapeType: params.shapeType,
      boundingBox: {
        x: params.x,
        y: params.y,
        w: params.width,
        h: params.height,
        rotation: params.rotation,
      },
      text: params.text,
      style: params.style,
      customData: params.customData,
    };

    this.currentPage.shapes.push(shape);
    return id;
  }

  /**
   * Add a process box (rectangle) shape
   */
  addProcessBox(params: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    text: string;
    fillColor?: string;
    strokeColor?: string;
  }): string {
    return this.addShape({
      shapeType: 'rectangle',
      x: params.x,
      y: params.y,
      width: params.width || 120,
      height: params.height || 60,
      text: params.text,
      style: {
        fill: { color: params.fillColor || '#FFFFFF', type: 'solid' },
        stroke: { color: params.strokeColor || '#000000', width: 2, style: 'solid' },
      },
    });
  }

  /**
   * Add a decision diamond shape
   */
  addDecisionDiamond(params: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    text: string;
    fillColor?: string;
    strokeColor?: string;
  }): string {
    return this.addShape({
      shapeType: 'diamond',
      x: params.x,
      y: params.y,
      width: params.width || 120,
      height: params.height || 80,
      text: params.text,
      style: {
        fill: { color: params.fillColor || '#FFE699', type: 'solid' },
        stroke: { color: params.strokeColor || '#000000', width: 2, style: 'solid' },
      },
    });
  }

  /**
   * Add a start/end oval shape
   */
  addStartEnd(params: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    text: string;
    fillColor?: string;
    strokeColor?: string;
  }): string {
    return this.addShape({
      shapeType: 'ellipse',
      x: params.x,
      y: params.y,
      width: params.width || 100,
      height: params.height || 50,
      text: params.text,
      style: {
        fill: { color: params.fillColor || '#C5E0B4', type: 'solid' },
        stroke: { color: params.strokeColor || '#000000', width: 2, style: 'solid' },
      },
    });
  }

  /**
   * Add a connector line between shapes or coordinates
   */
  addConnector(params: {
    fromShapeId?: string;
    toShapeId?: string;
    fromX?: number;
    fromY?: number;
    toX?: number;
    toY?: number;
    text?: string;
    strokeColor?: string;
    strokeWidth?: number;
  }): string {
    if (!this.currentPage) {
      throw new Error('No page available. Call addPage() first.');
    }

    const id = uuidv4();
    const line: LineDefinition = {
      id,
      endpoint1: {
        x: params.fromX || 0,
        y: params.fromY || 0,
        shapeId: params.fromShapeId,
        position: params.fromShapeId ? 'auto' : undefined,
      },
      endpoint2: {
        x: params.toX || 0,
        y: params.toY || 0,
        shapeId: params.toShapeId,
        position: params.toShapeId ? 'auto' : undefined,
      },
      text: params.text,
      style: {
        stroke: {
          color: params.strokeColor || '#000000',
          width: params.strokeWidth || 2,
          style: 'solid',
        },
      },
    };

    this.currentPage.lines.push(line);
    return id;
  }

  /**
   * Create a simple linear process flow
   */
  createLinearProcess(params: {
    steps: string[];
    startX?: number;
    startY?: number;
    verticalSpacing?: number;
  }): void {
    const startX = params.startX || 200;
    let currentY = params.startY || 100;
    const spacing = params.verticalSpacing || 120;

    let previousShapeId: string | null = null;

    for (let i = 0; i < params.steps.length; i++) {
      const step = params.steps[i];
      let shapeId: string;

      if (i === 0) {
        // First step is a start oval
        shapeId = this.addStartEnd({ x: startX, y: currentY, text: step });
      } else if (i === params.steps.length - 1) {
        // Last step is an end oval
        shapeId = this.addStartEnd({ x: startX, y: currentY, text: step });
      } else {
        // Middle steps are process boxes
        shapeId = this.addProcessBox({ x: startX, y: currentY, text: step });
      }

      // Connect to previous shape
      if (previousShapeId) {
        this.addConnector({
          fromShapeId: previousShapeId,
          toShapeId: shapeId,
        });
      }

      previousShapeId = shapeId;
      currentY += spacing;
    }
  }

  /**
   * Get the final document JSON
   */
  build(): DocumentDefinition {
    if (this.document.pages.length === 0) {
      throw new Error('Document must have at least one page');
    }
    return this.document;
  }

  /**
   * Get the document as a JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }
}

/**
 * Helper function to create a simple process map
 */
export function createSimpleProcessMap(params: {
  title: string;
  steps: string[];
}): DocumentDefinition {
  const builder = new LucidDocumentBuilder();
  builder.addPage(params.title);
  builder.createLinearProcess({ steps: params.steps });
  return builder.build();
}
