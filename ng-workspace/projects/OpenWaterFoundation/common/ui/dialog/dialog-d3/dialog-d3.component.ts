import { Component,
          Inject,
          OnInit }          from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as d3              from 'd3';

import { faXmark }          from '@fortawesome/free-solid-svg-icons';

import { D3Chart,
          D3Prop,
          OwfCommonService,
          Path }            from '@OpenWaterFoundation/common/services';
import { WindowManager }    from '@OpenWaterFoundation/common/ui/window-manager';

/**
 * D3 help.
 * Many D3 functions can utilize an anonymous function that provides access to
 * the current data element (d) and the index of the current data element (i).
 * (d: any, i: number)
 */
@Component({
  selector: 'lib-dialog-d3',
  templateUrl: './dialog-d3.component.html',
  styleUrls: ['./dialog-d3.component.css', '../main-dialog-style.css']
})
export class DialogD3Component implements OnInit {

  d3Prop: D3Prop;
  geoLayer: any;
  private svg: any;
  private windowId: string;
  windowManager: WindowManager = WindowManager.getInstance();
  /** All used icons in the DialogD3Component. */
  faXmark = faXmark;


  constructor(private dialogRef: MatDialogRef<DialogD3Component>,
  private commonService: OwfCommonService,
  @Inject(MAT_DIALOG_DATA) private matDialogData: any) {

    this.d3Prop = matDialogData.d3Prop;
    this.geoLayer = matDialogData.geoLayer;
    this.windowId = matDialogData.windowId;
  }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    switch(this.d3Prop.chartType) {

      case D3Chart.tree:
        if (this.d3Prop.dataPath.toUpperCase().endsWith('.JSON')) {
          this.commonService.getJSONData(this.commonService.buildPath(Path.d3P, [this.d3Prop.dataPath]))
          .subscribe((data: any) => {
            var data = this.renameKeys(data);
            // Create the tree and root hierarchy node given the provided
            // data, and other set up tasks.
            var tree = (data: any) => {
              const root: any = d3.hierarchy(data);
              root.dx = 10;
              root.dy = 954 / (root.height + 1);
              return d3.tree().nodeSize([root.dx, root.dy])(root);
            }
          
            const root: any = tree(data);
            this.createTidyTree(root);
          });

        } else if (this.d3Prop.dataPath.toUpperCase().endsWith('.CSV')) {
          this.commonService.getPlainText(this.commonService.buildPath(Path.d3P, [this.d3Prop.dataPath]))
          .subscribe((data: any) => {
            // Read in CSV file.
            var table = d3.csvParse(data);

            // Use d3.stratify to convert the CSV file into a D3 hierarchical node object.
            var hierarchy: any = d3.stratify()
            .id((d: any) => d[this.d3Prop.name])
            .parentId((d: any) => d[this.d3Prop.parent])
            (table);

            // Create the tree using the root hierarchy node.
            var tree = (data: any) => {
              const root: any = hierarchy;
              root.dx = 10;
              root.dy = 954 / (root.height + 1);
              return d3.tree().nodeSize([root.dx, root.dy])(root);
            }
          
            const root: any = tree(data);
            this.createTidyTree(root);
          });
        }
        break;

      case D3Chart.treemap:
        // Create the root hierarchy node with data from a JSON config file.
        if (this.d3Prop.dataPath.toUpperCase().endsWith('.JSON')) {
          this.commonService.getJSONData(this.commonService.buildPath(Path.d3P, [this.d3Prop.dataPath]))
          .subscribe((data: any) => {
            var data = this.renameKeys(data);
            // Create the treemap and root hierarchy node given the provided
            // data, and other set up tasks.
            var treemap = (data: any) => d3.treemap()
              .size([this.d3Prop.width, this.d3Prop.height])
              .padding(1)
              .round(true)
              (d3.hierarchy(data)
                .sum((d: any) => d.value)
                .sort((a: any, b: any) => b.value - a.value))
      
            const root = treemap(data);
            this.createTreeMap(root);
          });
        }
        // Create the root hierarchy node with data from a CSV config file.
        else if (this.d3Prop.dataPath.toUpperCase().endsWith('.CSV')) {
          this.commonService.getPlainText(this.commonService.buildPath(Path.d3P, [this.d3Prop.dataPath]))
          .subscribe((data: any) => {
            var table = d3.csvParse(data);
            this.replaceWithValue(table);

            // Convert the CSV to a D3 hierarchy node.
            var hierarchy: any = d3.stratify()
            .id((d: any) => d[this.d3Prop.name] )
            .parentId((d: any) => d[this.d3Prop.parent])
            (table);
            
            // Create the treemap and root hierarchy node given the provided
            // data, and other set up tasks.
            var treemap = (data: any) => d3.treemap()
              .size([this.d3Prop.width, this.d3Prop.height])
              .padding(1)
              .round(true)
              (hierarchy
                .sum((d: any) => d.value)
                .sort((a: any, b: any) => b.value - a.value)
              )

            const root = treemap(data);
            this.createTreeMap(root);
          });
        }
        break;
    }
  }

  /**
   * Creates a static Tidy Tree svg, populated with properties from a user given
   * configuration file.
   */
  private createTidyTree(root: any): void {

    let x0 = Infinity;
    let x1 = -x0;
    root.each((d: any) => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    this.svg = d3.select("svg#d3-chart")
      .attr("viewBox", '0, 0, ' + this.d3Prop.width + ', ' + (x1 - x0 + root.dx * 2));
    
    const g = this.svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 11)
      .attr("transform", `translate(${root.dy / 2},${root.dx - x0})`);
      
    const link = g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
        .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x));
    
    const node = g.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants())
      .join("g")
        .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    // NOTE: All d.children is being used from the created hierarchy node, which
    // will have children as a property by default. This is why it can be used
    // without the user-provided d3Prop object.
    node.append("circle")
      .attr("fill", (d: any) => d.children ? "#555" : "#999")
      .attr("r", 2.5);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: any) => d.children ? -6 : 6)
      // Whether the node's name value is displayed before or after the bullet.
      .attr("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any) => d.data[this.d3Prop.name])
      .clone(true).lower()
      .attr("stroke", "white");
          
  }

  /**
   * Create a TreeMap with properties populated by given user configuration files.
   */
   private createTreeMap(root: any): void {
    // Used for uniquely naming each rect tag and its clipped path tag, so each rect's
    // text can't be seen passed its boundary.
    var idNum = 0;
    // Define the way to format number display.
    var format = d3.format(",d");
    // Set the color scheme for the treemap. Look for a user provided colorScheme
    // first, and use a D3 provided scheme if none is found.
    var color: any;
    if (this.d3Prop.colorScheme) {
      color = d3.scaleOrdinal(this.d3Prop.colorScheme);
    } else {
      color = d3.scaleOrdinal(d3.schemeCategory10);
    }

    // Create the svg container and the necessary set up properties.
    const svg = d3.select("svg#d3-chart")
    // The viewBox is used for making the graph responsive to its surroundings.
    .attr("viewBox", '0, 0, ' + this.d3Prop.width + ', ' + this.d3Prop.height)
    .style("font", "sans-serif");

    const leaf = svg.selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    // Create the tooltip for the g tag.
    leaf.append("title")
    .text((d: any) => `${d.ancestors().reverse().map((d: any) => d.data[this.d3Prop.name]).join("/")}\n${format(d.value)}`);

    // Create the rect tag and style it. Assign a unique CSS id based on the idNum variable.
    
    leaf.append("rect")
    .attr("id", (d: any) => (d.leafUid = ++idNum + '-id'))
    .attr("fill", (d: any) => { while (d.depth > 1) d = d.parent; return color(d.data[this.d3Prop.name]); })
    .attr("fill-opacity", 0.6)
    .attr("width", (d: any) => d.x1 - d.x0)
    .attr("height", (d: any) => d.y1 - d.y0);
    // Create the clipPath tag with a unique id to be referenced by the text in the rect.
    leaf.append("clipPath")
    .attr("id", (d: any) => (d.clipUid = ++idNum + '-id'))
    // The use element takes nodes from within the SVG document, and duplicates them.
    .append("use")
    // xlink:href used to be used, but has been deprecated. Can just return the CSS
    // #id and it will find the leafUid assigned earlier.
    .attr("href", (d: any) => '#' + d.leafUid);

    // Create the actual text in each rect element.
    leaf.append("text")
    // The clip-path tag must be given a URL to the clipped path, or else the
    // tag's property is just another string.
    .attr("clip-path", (d: any) => 'url(#' + d.clipUid + ')')
    .selectAll("tspan")
    .data((d: any) => d.data[this.d3Prop.name].split(/(?=[A-Z][a-z])|\s+/g).concat(format(d.value)))
    .join("tspan")
    // Set the text x- and y-based offsets from the rect's top left corner.
    .attr("x", 2)
    .attr("y", (d, i, nodes) => `${1.1 + i * 0.9}em`)
    .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
    .text((d: any) => d);

    // Set the size of the font for all tspan tags. Note because the vis is responsive
    // the text will also appear to increase and decrease in size to users.
    d3.selectAll("tspan").attr("font-size", "8px");

  }

  // margin is the space between each bar on the graph.
  // private createBarSvg(): void {
  //   this.svg = d3.select("svg#d3-chart")
  //   .append("svg")
  //   .attr("width", '100%')
  //   .attr("height", '100%')
  //   .attr("viewBox", '0 0 ' + 815 + ' ' + 500)
  //   // .attr('preserveAspectRatio', 'xMinyMin')
  //   .append("g")
  //   .attr("transform", "translate(" + this.d3Prop.margin + "," + this.d3Prop.margin + ")");
  // }

  // private drawBars(data: any[]): void {
  //   var currentWidth = parseInt(d3.select('svg#d3-chart').style('width'));
  //   this.svg.attr('width', currentWidth)

  //   // Create the X-axis band scale
  //   const x = d3.scaleBand()
  //   .range([0, currentWidth])
  //   .domain(data.map(d => d.Framework))
  //   .padding(0.2);

  //   // Draw the X-axis on the DOM
  //   this.svg.append("g")
  //   .attr("transform", "translate(0," + this.d3Prop.height + ")")
  //   .call(d3.axisBottom(x))
  //   .selectAll("text")
  //   .attr("font-size", 12)
  //   .attr("transform", "translate(-10,0)rotate(-45)")
  //   .style("text-anchor", "end");

  //   // Create the Y-axis band scale
  //   const y = d3.scaleLinear()
  //   .domain([0, 200000])
  //   .range([this.d3Prop.height, 0]);

  //   // Draw the Y-axis on the DOM
  //   this.svg.append("g")
  //   .attr("font-size", 12)
  //   .call(d3.axisLeft(y));

  //   // Create and fill the bars
  //   this.svg.selectAll("bars")
  //   .data(data)
  //   .enter()
  //   .append("rect")
  //   .attr("x", (d: any) => x(d.Framework))
  //   .attr("y", (d: any) => y(d.Stars))
  //   .attr("width", x.bandwidth())
  //   .attr("height", (d: any) => this.d3Prop.height - y(d.Stars))
  //   .attr("fill", "#d04a35");
  // }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
   onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowId);
  }

  /**
   * Recursively go through an object and update the 'name' and 'children' key
   * names from a JSON object.
   * @param obj The nested object whose key names need updating.
   * @returns The object with the changed key names.
   */
  private renameKeys(obj: any) {
    const keyValues = Object.keys(obj).map(key => {
      let newKey = null;
      if (key === this.d3Prop.value) {
        newKey = 'value';
      } else if (key === this.d3Prop.children) {
        newKey = 'children';
      } else {
        newKey = key;
      }
      if (key === this.d3Prop.children) {
        obj[key] = obj[key].map((obj: any) => this.renameKeys(obj));    
      }
      return {
        [newKey]: obj[key]
      };
    });
    return Object.assign({}, ...keyValues);
  }

  /**
   * Iterates over each CSV row as an object, checks to see if the row contains
   * the value string provided in the config file, and changes its name to `value`,
   * to be used by D3.
   * @param table The D3 DSVRowArray, which contains an array of objects where each
   * object is a row in a CSV data file.
   */
  private replaceWithValue(table: any): any {
    for (let dataElement of table) {
      if (dataElement[this.d3Prop.value]) {
        delete Object.assign(dataElement, {['value']: dataElement[this.d3Prop.value] })[this.d3Prop.value];
      }
    }
  }

}
