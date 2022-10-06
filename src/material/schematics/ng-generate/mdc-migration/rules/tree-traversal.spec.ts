import {
  updateAttribute,
  visitElements,
  parseTemplate,
  replaceStartTag,
  replaceEndTag,
} from './tree-traversal';

function runTagNameDuplicationTest(html: string, result: string): void {
  visitElements(
    parseTemplate(html).nodes,
    node => {
      html = replaceEndTag(html, node, node.name.repeat(2));
    },
    node => {
      html = replaceStartTag(html, node, node.name.repeat(2));
    },
  );
  expect(html).toBe(result);
}

function runAddAttributeTest(html: string, result: string): void {
  visitElements(parseTemplate(html).nodes, undefined, node => {
    html = updateAttribute(html, node, 'add', () => 'val');
  });
  expect(html).toBe(result);
}

function runRemoveAttributeTest(html: string, result: string): void {
  visitElements(parseTemplate(html).nodes, undefined, node => {
    html = updateAttribute(html, node, 'rm', () => null);
  });
  expect(html).toBe(result);
}

function runChangeAttributeTest(html: string, result: string): void {
  visitElements(parseTemplate(html).nodes, undefined, node => {
    html = updateAttribute(html, node, 'change', old => (old == ':(' ? ':)' : old));
  });
  expect(html).toBe(result);
}

function runClearAttributeTest(html: string, result: string): void {
  visitElements(parseTemplate(html).nodes, undefined, node => {
    html = updateAttribute(html, node, 'clear', () => '');
  });
  expect(html).toBe(result);
}

describe('#visitElements', () => {
  describe('tag name replacements', () => {
    it('should handle basic cases', async () => {
      runTagNameDuplicationTest('<a></a>', '<aa></aa>');
    });

    it('should handle multiple same line', async () => {
      runTagNameDuplicationTest('<a></a><b></b>', '<aa></aa><bb></bb>');
    });

    it('should handle multiple same line nested', async () => {
      runTagNameDuplicationTest('<a><b></b></a>', '<aa><bb></bb></aa>');
    });

    it('should handle multiple same line nested and unnested', async () => {
      runTagNameDuplicationTest('<a><b></b><c></c></a>', '<aa><bb></bb><cc></cc></aa>');
    });

    it('should handle multiple multi-line', async () => {
      runTagNameDuplicationTest(
        `
          <a></a>
          <b></b>
        `,
        `
          <aa></aa>
          <bb></bb>
        `,
      );
    });

    it('should handle multiple multi-line nested', async () => {
      runTagNameDuplicationTest(
        `
          <a>
            <b></b>
          </a>
        `,
        `
          <aa>
            <bb></bb>
          </aa>
        `,
      );
    });

    it('should handle multiple multi-line nested and unnested', async () => {
      runTagNameDuplicationTest(
        `
          <a>
            <b></b>
            <c></c>
          </a>
        `,
        `
          <aa>
            <bb></bb>
            <cc></cc>
          </aa>
        `,
      );
    });
  });

  describe('add attribute tests', () => {
    it('should handle single element', async () => {
      runAddAttributeTest('<a></a>', '<a add="val"></a>');
    });

    it('should handle multiple unnested', async () => {
      runAddAttributeTest('<a></a><b></b>', '<a add="val"></a><b add="val"></b>');
    });

    it('should handle multiple nested', async () => {
      runAddAttributeTest('<a><b></b></a>', '<a add="val"><b add="val"></b></a>');
    });

    it('should handle multiple nested and unnested', async () => {
      runAddAttributeTest(
        '<a><b></b><c></c></a>',
        '<a add="val"><b add="val"></b><c add="val"></c></a>',
      );
    });

    it('should handle adding multiple attrs to a single element', async () => {
      let html = '<a></a>';
      visitElements(parseTemplate(html).nodes, undefined, node => {
        html = updateAttribute(html, node, 'attr1', () => 'val1');
        html = updateAttribute(html, node, 'attr2', () => 'val2');
      });
      expect(html).toBe('<a attr2="val2" attr1="val1"></a>');
    });

    it('should replace value of existing attribute', async () => {
      runAddAttributeTest('<a add="default"></a>', '<a add="val"></a>');
    });

    it('should add value to existing attribute that does not have a value', async () => {
      runAddAttributeTest('<a add></a>', '<a add="val"></a>');
    });
  });

  describe('remove attribute tests', () => {
    it('should remove attribute', () => {
      runRemoveAttributeTest('<a rm="something"></a>', '<a></a>');
    });

    it('should remove empty attribute', () => {
      runRemoveAttributeTest('<a rm></a>', '<a></a>');
    });

    it('should remove unquoted attribute', () => {
      runRemoveAttributeTest('<a rm=3></a>', '<a></a>');
    });

    it('should remove value-less attribute', () => {
      runRemoveAttributeTest('<a rm></a>', '<a></a>');
    });

    it('should not change element without attribute', () => {
      runRemoveAttributeTest('<a></a>', '<a></a>');
    });

    it('should not remove other attributes', () => {
      runRemoveAttributeTest(
        `
          <a
             first="1"
             rm="2"
             last="3">
          </a>
          `,
        `
          <a
             first="1"
             last="3">
          </a>
          `,
      );
    });
  });

  describe('change attribute tests', () => {
    it('should change attribute with matching value', () => {
      runChangeAttributeTest('<a change=":("></a>', '<a change=":)"></a>');
    });

    it('should not change attribute with non-matching value', () => {
      runChangeAttributeTest('<a change="x"></a>', '<a change="x"></a>');
    });
  });

  describe('clear attribute tests', () => {
    it('should clear attribute with value', () => {
      runClearAttributeTest('<a clear="something"></a>', '<a clear></a>');
    });

    it('should preserve value-less attribute', () => {
      runClearAttributeTest('<a clear></a>', '<a clear></a>');
    });

    it('should add attribute to element without it', () => {
      runClearAttributeTest('<a></a>', '<a clear></a>');
    });
  });

  it('should match indentation', async () => {
    runAddAttributeTest(
      `
        <a
          class="a"
          aria-label="a"
          aria-describedby="a"
        ></a>
      `,
      `
        <a
          add="val"
          class="a"
          aria-label="a"
          aria-describedby="a"
        ></a>
      `,
    );
  });

  it('should match indentation w/ multiple attrs', async () => {
    let html = `
      <a
        class="a"
        aria-label="a"
        aria-describedby="a"
      ></a>
    `;
    visitElements(parseTemplate(html).nodes, undefined, node => {
      html = updateAttribute(html, node, 'attr1', () => 'val1');
      html = updateAttribute(html, node, 'attr2', () => 'val2');
    });
    expect(html).toBe(`
      <a
        attr2="val2"
        attr1="val1"
        class="a"
        aria-label="a"
        aria-describedby="a"
      ></a>
    `);
  });
});
