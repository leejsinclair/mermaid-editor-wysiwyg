import { describe, expect, it } from "vitest";
import { generateC4 } from "../generation/c4";
import { c4Diagram, element } from "../testing/c4Builder";
import { readC4 } from "./c4";

// VO-011 (FR-005): each C4 kind's statements become the editor's elements, boundaries, Deployment nodes and relationships,
// with the same labels, technology, descriptions, nesting, direction and order. Ids follow the statements, depth first.

describe("readC4", () => {
  it("reads a Context document: every element type, boundaries, nesting, one-way and two-way relationships and the title", () => {
    const text = [
      "C4Context",
      "  title Bank",
      '  Enterprise_Boundary(ent, "Bank") {',
      '    Person(cust, "Customer", "A bank customer")',
      '    Person_Ext(ext, "Regulator")',
      '    System(core, "Core", "Holds accounts")',
      '    SystemDb(db, "Ledger")',
      '    SystemQueue_Ext(q, "Queue", "Outside")',
      '    System_Boundary(sb, "Internal") {',
      '      System_Ext(web, "Web")',
      "    }",
      "  }",
      '  Rel(cust, core, "Uses", "HTTPS")',
      '  BiRel(core, ext, "Reports")',
    ].join("\n");
    const result = readC4(text, "context");
    expect(result.title).toBe("Bank");
    expect(result.tree).toEqual([
      {
        item: "boundary",
        id: 1,
        boundaryType: "enterprise",
        label: "Bank",
        children: [
          { item: "element", id: 2, elementType: "person", label: "Customer", description: "A bank customer", technology: "" },
          { item: "element", id: 3, elementType: "person-ext", label: "Regulator", description: "", technology: "" },
          { item: "element", id: 4, elementType: "system", label: "Core", description: "Holds accounts", technology: "" },
          { item: "element", id: 5, elementType: "system-db", label: "Ledger", description: "", technology: "" },
          { item: "element", id: 6, elementType: "system-queue-ext", label: "Queue", description: "Outside", technology: "" },
          {
            item: "boundary",
            id: 7,
            boundaryType: "system",
            label: "Internal",
            children: [{ item: "element", id: 8, elementType: "system-ext", label: "Web", description: "", technology: "" }],
          },
        ],
      },
    ]);
    expect(result.relationships).toEqual([
      { id: 9, from: 2, to: 4, direction: "one-way", label: "Uses", technology: "HTTPS" },
      { id: 10, from: 4, to: 3, direction: "two-way", label: "Reports", technology: "" },
    ]);
    expect(result.nextId).toBe(11);
  });

  it("reads a Container document with technology and the database, queue and external forms", () => {
    const text = [
      "C4Container",
      '  Person(user, "User")',
      '  System_Boundary(sys, "Shop") {',
      '    Container(web, "Web App", "React", "The storefront")',
      '    ContainerDb(db, "Orders DB", "PostgreSQL", "Orders")',
      '    ContainerQueue(q, "Events", "Kafka", "")',
      '    Container_Ext(pay, "Payments", "Stripe", "External")',
      "  }",
      '  Rel(user, web, "Browses", "HTTPS")',
    ].join("\n");
    const result = readC4(text, "container");
    expect(result.tree).toEqual([
      { item: "element", id: 1, elementType: "person", label: "User", description: "", technology: "" },
      {
        item: "boundary",
        id: 2,
        boundaryType: "system",
        label: "Shop",
        children: [
          { item: "element", id: 3, elementType: "container", label: "Web App", description: "The storefront", technology: "React" },
          { item: "element", id: 4, elementType: "container-db", label: "Orders DB", description: "Orders", technology: "PostgreSQL" },
          { item: "element", id: 5, elementType: "container-queue", label: "Events", description: "", technology: "Kafka" },
          { item: "element", id: 6, elementType: "container-ext", label: "Payments", description: "External", technology: "Stripe" },
        ],
      },
    ]);
    expect(result.relationships).toEqual([{ id: 7, from: 1, to: 3, direction: "one-way", label: "Browses", technology: "HTTPS" }]);
  });

  it("reads a Component document with a Container boundary and the component forms", () => {
    const text = [
      "C4Component",
      '  Container_Boundary(api, "API") {',
      '    Component(ctrl, "Controller", "Express", "Handles requests")',
      '    ComponentDb(repo, "Repo", "SQL", "")',
      '    ComponentQueue_Ext(bus, "Bus", "AMQP", "")',
      '    Component_Ext(lib, "Lib", "JS", "")',
      "  }",
      '  Rel(ctrl, repo, "Reads")',
    ].join("\n");
    const result = readC4(text, "component");
    expect(result.tree).toEqual([
      {
        item: "boundary",
        id: 1,
        boundaryType: "container",
        label: "API",
        children: [
          { item: "element", id: 2, elementType: "component", label: "Controller", description: "Handles requests", technology: "Express" },
          { item: "element", id: 3, elementType: "component-db", label: "Repo", description: "", technology: "SQL" },
          { item: "element", id: 4, elementType: "component-queue-ext", label: "Bus", description: "", technology: "AMQP" },
          { item: "element", id: 5, elementType: "component-ext", label: "Lib", description: "", technology: "JS" },
        ],
      },
    ]);
    expect(result.relationships).toEqual([{ id: 6, from: 2, to: 3, direction: "one-way", label: "Reads", technology: "" }]);
  });

  it("reads a Dynamic document's relationships in the order they are written", () => {
    const text = [
      "C4Dynamic",
      '  Person(user, "User")',
      '  Container(web, "Web", "React")',
      '  RelIndex(1, user, web, "Opens the page", "HTTPS")',
      '  RelIndex(2, web, user, "Shows it")',
    ].join("\n");
    const result = readC4(text, "dynamic");
    expect(result.relationships.map((relationship) => [relationship.from, relationship.to, relationship.label])).toEqual([
      [1, 2, "Opens the page"],
      [2, 1, "Shows it"],
    ]);
    expect(result.relationships[0]?.technology).toBe("HTTPS");
  });

  it("reads a Deployment document: nested nodes, containers in nodes, and a relationship to a node", () => {
    const text = [
      "C4Deployment",
      '  Deployment_Node(dc, "Data Centre", "AWS") {',
      '    Node(app, "App server", "Linux", "Runs the app") {',
      '      Container(api, "API", "Node.js")',
      "    }",
      '    Node_L(db, "DB host")',
      '    Node_R(cache, "Cache host")',
      "  }",
      '  Rel(api, cache, "Caches", "TCP")',
    ].join("\n");
    const result = readC4(text, "deployment");
    expect(result.tree).toEqual([
      {
        item: "deployment-node",
        id: 1,
        label: "Data Centre",
        description: "",
        technology: "AWS",
        children: [
          {
            item: "deployment-node",
            id: 2,
            label: "App server",
            description: "Runs the app",
            technology: "Linux",
            children: [{ item: "element", id: 3, elementType: "container", label: "API", description: "", technology: "Node.js" }],
          },
          { item: "deployment-node", id: 4, label: "DB host", description: "", technology: "", children: [] },
          { item: "deployment-node", id: 5, label: "Cache host", description: "", technology: "", children: [] },
        ],
      },
    ]);
    expect(result.relationships).toEqual([{ id: 6, from: 3, to: 5, direction: "one-way", label: "Caches", technology: "TCP" }]);
  });

  it("keeps two relationships between the same two elements", () => {
    const text = ["C4Context", '  Person(a, "A")', '  System(b, "B")', '  Rel(a, b, "Asks")', '  Rel(a, b, "Calls")'].join("\n");
    const result = readC4(text, "context");
    expect(result.relationships.map((relationship) => relationship.label)).toEqual(["Asks", "Calls"]);
  });

  // VO-001 (FR-001, US1-AS1): the editor's own C4 output escapes its fields; reading it back gives the typed text.
  it("decodes the escapes the editor writes in an element's label, description and technology", () => {
    const typed = element(1, "container", "R&D", { description: '"fast" <cheap>', technology: "C#" });
    const { source } = generateC4(c4Diagram("container", [typed]));
    const [read] = readC4(source, "container").tree;
    expect(read).toMatchObject({ label: "R&D", description: '"fast" <cheap>', technology: "C#" });
  });

  // VO-002 (FR-001, US1-AS3): every other text field is decoded the way a flowchart label is: Mermaid's `#…;` escapes,
  // `<br/>` and entities.
  it("decodes boundary, Deployment node, relationship and title text", () => {
    const escaped = "A#38;B#quot; &lt;x&gt;<br/>two";
    const decoded = 'A&B" <x>\ntwo';
    const boundaries = ["C4Context", `  title ${escaped}`, `  System_Boundary(b, "${escaped}") {`, '    System(s1, "S1")', "  }", '  System(s2, "S2")', `  Rel(s1, s2, "${escaped}", "${escaped}")`].join("\n");
    const context = readC4(boundaries, "context");
    expect(context.title).toBe(decoded);
    expect(context.tree[0]).toMatchObject({ item: "boundary", label: decoded });
    expect(context.relationships[0]).toMatchObject({ label: decoded, technology: decoded });
    const nodes = ["C4Deployment", `  Deployment_Node(d, "${escaped}", "${escaped}", "${escaped}") {`, '    Container(c, "C", "T")', "  }"].join("\n");
    expect(readC4(nodes, "deployment").tree[0]).toMatchObject({ item: "deployment-node", label: decoded, technology: decoded, description: decoded });
  });

  // VO-004 (FR-001, DC-01): the C4 import has no report entry for removed tags, so a tag is kept as text, not removed.
  it("keeps an HTML tag in C4 text as typed", () => {
    const text = ["C4Context", '  System(s, "<b>x</b>", "a <i>b</i>")'].join("\n");
    expect(readC4(text, "context").tree[0]).toMatchObject({ label: "<b>x</b>", description: "a <i>b</i>" });
  });

  // VO-027 (FR-001, PR #5): an entity in hand-written source is decoded once, whole: the `#65;` inside `&#65;` is not read
  // as a Mermaid escape on its own.
  it("decodes decimal, hexadecimal and named entities in hand-written C4 source", () => {
    const text = ["C4Context", '  System(s, "&#65; &#x42; &amp;")'].join("\n");
    expect(readC4(text, "context").tree[0]).toMatchObject({ label: "A B &" });
  });

  // VO-032 (FR-001, PR #5): a numeric entity that names no character is kept as typed; reading never throws.
  it("keeps a numeric entity that names no character as typed", () => {
    const text = ["C4Context", '  System(s, "&#xzz; &#99999999;")'].join("\n");
    expect(readC4(text, "context").tree[0]).toMatchObject({ label: "&#xzz; &#99999999;" });
  });
});
