// © 2026 Dr. Richard J. Terrile - Ancient Civilizations Timeline. All rights reserved.
// Ancient Civilizations Timeline - Geographic Groups
d3.json('data/civilizations.json').then(data => {
    const allCivs = data.civilizations;
    const connectionTypes = data.metadata.connection_types;
    const confidenceLevels = data.metadata.confidence_levels;

    // Region order and colors
    const regionOrder = [
        "Mesopotamia",
        "Egypt & North Africa",
        "Levant & Arabia",
        "Anatolia & Persia",
        "Europe & Mediterranean",
        "Africa & Horn",
        "Asia",
        "Americas"
    ];
    const regionColors = {
        "Mesopotamia":            "#8B4513",
        "Egypt & North Africa":   "#DAA520",
        "Levant & Arabia":        "#2E8B57",
        "Anatolia & Persia":      "#B8860B",
        "Europe & Mediterranean": "#4169E1",
        "Africa & Horn":          "#8B0000",
        "Asia":                   "#6A0DAD",
        "Americas":               "#2F4F4F"
    };

    // Sort civs by region order, then by start year within region
    const sortedCivs = [...allCivs].sort((a, b) => {
        const ra = regionOrder.indexOf(a.region);
        const rb = regionOrder.indexOf(b.region);
        if (ra !== rb) return ra - rb;
        return a.period.start.year - b.period.start.year;
    });

    // Build row list: interleave region headers + civs
    // Each row is either { type:'header', region } or { type:'civ', civ }
    const rows = [];
    let lastRegion = null;
    sortedCivs.forEach(civ => {
        if (civ.region !== lastRegion) {
            rows.push({ type: 'header', region: civ.region });
            lastRegion = civ.region;
        }
        rows.push({ type: 'civ', civ });
    });

    const margin = { top: 20, right: 20, bottom: 50, left: 0 };
    const verticalSpacing = 35;
    const headerHeight = 28;
    const barHeight = 25;

    // Compute Y position for each row
    let yOffset = margin.top;
    rows.forEach(row => {
        row.y = yOffset;
        yOffset += row.type === 'header' ? headerHeight : verticalSpacing;
    });
    const totalHeight = yOffset + margin.bottom;

    const timeExtent = d3.extent(allCivs.flatMap(c => [c.period.start.year, c.period.end.year]));
    const totalYears = timeExtent[1] - timeExtent[0];
    const basePxPerYear = 0.08;
    let currentPxPerYear = basePxPerYear;

    function formatYear(y) {
        if (y < 0) return Math.abs(y) + ' BCE';
        if (y === 0) return '1 BCE/CE';
        return y + ' CE';
    }

    // 30-color palette
    const civColors = [
        '#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c',
        '#3498db','#9b59b6','#e91e63','#00bcd4','#8bc34a',
        '#ff5722','#607d8b','#795548','#ff9800','#4caf50',
        '#2196f3','#673ab7','#f44336','#009688','#cddc39',
        '#d35400','#27ae60','#2980b9','#8e44ad','#c0392b',
        '#16a085','#f39c12','#1abc9c','#e91e63','#3498db'
    ];
    // Assign colors by index within sorted civs list
    const civColorMap = {};
    sortedCivs.forEach((civ, i) => { civColorMap[civ.name] = civColors[i % civColors.length]; });

    const confidenceColors = { high: '#2ecc71', medium: '#f1c40f', low: '#e74c3c' };
    const confidenceOpacity = { high: 0.9, medium: 0.65, low: 0.4 };

    const connectionStyles = {
        trade:                { color: '#3498db', dash: '5,5' },
        cultural_exchange:    { color: '#9b59b6', dash: '0' },
        conquest:             { color: '#e74c3c', dash: '0' },
        succession:           { color: '#2ecc71', dash: '10,5' },
        cultural_inheritance: { color: '#f1c40f', dash: '15,5' },
        cultural_absorption:  { color: '#e67e22', dash: '8,4,2,4' },
        conflict:             { color: '#c0392b', dash: '0' }
    };
    const defaultStyle = { color: '#999', dash: '4,4' };

    // --- Names column ---
    const namesCol = d3.select('.names-column');
    rows.forEach(row => {
        if (row.type === 'header') {
            namesCol.append('div')
                .style('position', 'absolute')
                .style('top', row.y + 'px')
                .style('height', headerHeight + 'px')
                .style('width', '240px')
                .style('background', regionColors[row.region] || '#555')
                .style('color', 'white')
                .style('font-size', '11px')
                .style('font-weight', 'bold')
                .style('line-height', headerHeight + 'px')
                .style('padding-left', '8px')
                .style('letter-spacing', '0.5px')
                .text(row.region.toUpperCase());
        } else {
            namesCol.append('div')
                .attr('class', 'civilization-name')
                .style('top', row.y + 'px')
                .text(row.civ.name);
        }
    });

    // Set names column height
    // Set inner scroll height so names column scrolls full range
    namesCol.append('div')
        .style('height', totalHeight + 'px')
        .style('width', '1px');

    // --- SVG ---
    function getSvgWidth() {
        return Math.round(totalYears * currentPxPerYear) + margin.left + margin.right + 100;
    }

    const svg = d3.select('.timeline-content')
        .append('svg')
        .attr('height', totalHeight);

    function makeScale() {
        return d3.scaleLinear()
            .domain(timeExtent)
            .range([margin.left, getSvgWidth() - margin.right - 100]);
    }

    function draw() {
        const w = getSvgWidth();
        svg.attr('width', w);
        d3.select('.timeline-content').style('min-width', w + 'px');
        const timeScale = makeScale();
        svg.selectAll('*').remove();

        // Region background bands
        const regionBands = svg.append('g').attr('class', 'region-bands');
        rows.forEach(row => {
            if (row.type === 'header') {
                regionBands.append('rect')
                    .attr('x', 0).attr('y', row.y)
                    .attr('width', w).attr('height', headerHeight)
                    .attr('fill', regionColors[row.region] || '#555')
                    .attr('opacity', 0.15);
                regionBands.append('text')
                    .attr('x', 8).attr('y', row.y + headerHeight / 2 + 5)
                    .attr('font-size', '11px')
                    .attr('font-weight', 'bold')
                    .attr('fill', regionColors[row.region] || '#555')
                    .attr('opacity', 0.7)
                    .attr('letter-spacing', '1px')
                    .text(row.region.toUpperCase());
            }
        });

        // Connection lines (behind bars)
        const civRowMap = {};
        rows.forEach(row => { if (row.type === 'civ') civRowMap[row.civ.name] = row; });

        const connectionData = allCivs.flatMap(civ =>
            (civ.connections || [])
                .map(conn => ({
                    source: civ,
                    target: allCivs.find(c => c.name === conn.civilization),
                    type: conn.type
                }))
                .filter(conn => conn.target != null)
        );

        svg.append('g').attr('class', 'connections')
            .selectAll('path')
            .data(connectionData)
            .enter().append('path')
            .style('fill', 'none')
            .style('stroke', d => (connectionStyles[d.type] || defaultStyle).color)
            .style('stroke-width', 1.5)
            .style('stroke-dasharray', d => (connectionStyles[d.type] || defaultStyle).dash)
            .style('opacity', 0.35)
            .attr('d', d => {
                const sr = civRowMap[d.source.name];
                const tr = civRowMap[d.target.name];
                if (!sr || !tr) return '';
                const sy = sr.y + barHeight / 2;
                const ty = tr.y + barHeight / 2;
                const sx = timeScale(d.source.period.start.year);
                const tx = timeScale(d.target.period.start.year);
                const mx = (sx + tx) / 2;
                return 'M'+sx+','+sy+' C'+mx+','+sy+' '+mx+','+ty+' '+tx+','+ty;
            });

        // Bars
        const barGroup = svg.append('g').attr('class', 'bars');
        rows.forEach(row => {
            if (row.type !== 'civ') return;
            const civ = row.civ;
            const color    = civColorMap[civ.name] || '#999';
            const startConf = confidenceColors[civ.period.start.confidence] || '#ccc';
            const endConf   = confidenceColors[civ.period.end.confidence]   || '#ccc';
            const opacity   = confidenceOpacity[civ.period.start.confidence] || 0.7;
            const x  = timeScale(civ.period.start.year);
            const y  = row.y;
            const bw = Math.max(4, timeScale(civ.period.end.year) - timeScale(civ.period.start.year));
            const confW = Math.min(6, bw / 4);
            const textY = y + barHeight / 2 + 4;

            const bar = barGroup.append('rect')
                .attr('x', x + confW).attr('y', y)
                .attr('width', Math.max(0, bw - confW * 2))
                .attr('height', barHeight)
                .attr('fill', color).attr('fill-opacity', opacity)
                .attr('rx', 2).style('cursor', 'pointer');

            barGroup.append('rect').attr('x', x).attr('y', y)
                .attr('width', confW).attr('height', barHeight)
                .attr('fill', startConf).attr('rx', 2).style('pointer-events','none');
            barGroup.append('rect').attr('x', x + bw - confW).attr('y', y)
                .attr('width', confW).attr('height', barHeight)
                .attr('fill', endConf).attr('rx', 2).style('pointer-events','none');

            const startLabel = barGroup.append('text')
                .attr('x', x - 4).attr('y', textY).attr('text-anchor','end')
                .attr('font-size','10px').attr('fill','#222')
                .style('pointer-events','none').style('display','none')
                .text(formatYear(civ.period.start.year));
            const endLabel = barGroup.append('text')
                .attr('x', x + bw + 4).attr('y', textY).attr('text-anchor','start')
                .attr('font-size','10px').attr('fill','#222')
                .style('pointer-events','none').style('display','none')
                .text(formatYear(civ.period.end.year));

            bar.on('mouseover', function() {
                    d3.select(this).attr('fill-opacity',1).attr('stroke','#333').attr('stroke-width',1.5);
                    startLabel.style('display',null); endLabel.style('display',null);
                    showDetails(civ);
                })
                .on('mouseout', function() {
                    d3.select(this).attr('fill-opacity',opacity).attr('stroke','none');
                    startLabel.style('display','none'); endLabel.style('display','none');
                });
        });

        // Time axis
        svg.append('g')
            .attr('transform', 'translate(0,' + (totalHeight - margin.bottom) + ')')
            .call(d3.axisBottom(timeScale).tickFormat(d => formatYear(d)));
    }

    draw();

    // Zoom
    document.getElementById('zoom-in').addEventListener('click', () => {
        currentPxPerYear = Math.min(currentPxPerYear * 1.5, 5); draw();
    });
    document.getElementById('zoom-out').addEventListener('click', () => {
        currentPxPerYear = Math.max(currentPxPerYear / 1.5, 0.02); draw();
    });
    document.getElementById('zoom-reset').addEventListener('click', () => {
        currentPxPerYear = basePxPerYear; draw();
        document.getElementById('details-panel').classList.remove('visible');
    });
    document.querySelector('.timeline-scroll').addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            currentPxPerYear = e.deltaY < 0
                ? Math.min(currentPxPerYear * 1.15, 5)
                : Math.max(currentPxPerYear / 1.15, 0.02);
            draw();
        }
    }, { passive: false });

    // Legends
    const cl = d3.select('#confidence-legend').selectAll('.legend-item')
        .data(Object.entries(confidenceLevels)).enter().append('div').attr('class','legend-item');
    cl.append('div').attr('class','legend-color')
        .style('background-color', d => confidenceColors[d[0]])
        .style('width','6px').style('height','16px').style('margin-right','8px');
    cl.append('div').attr('class','legend-label').text(d => d[1]);

    const nl = d3.select('#connection-legend').selectAll('.legend-item')
        .data(Object.entries(connectionTypes)).enter().append('div').attr('class','legend-item');
    nl.append('div').attr('class','legend-color')
        .style('width','22px').style('height','0px')
        .style('border-top', d => '2px '+((connectionStyles[d[0]]||defaultStyle).dash==='0'?'solid ':'dashed ')+(connectionStyles[d[0]]||defaultStyle).color)
        .style('background','none').style('margin-right','8px');
    nl.append('div').attr('class','legend-label').text(d => d[1]);

    // Region legend
    const rl = d3.select('#region-legend').selectAll('.legend-item')
        .data(regionOrder).enter().append('div').attr('class','legend-item');
    rl.append('div').attr('class','legend-color')
        .style('background-color', d => regionColors[d])
        .style('width','14px').style('height','14px').style('margin-right','8px').style('border-radius','2px');
    rl.append('div').attr('class','legend-label').text(d => d);

    // Details panel
    function showDetails(d) {
        const panel = document.getElementById('details-panel');
        const regionColor = regionColors[d.region] || '#555';
        panel.innerHTML =
            '<div style="border-left:4px solid '+regionColor+';padding-left:10px">'+
            '<h3 style="margin-top:0">'+d.name+'</h3>'+
            '<p><strong>Region:</strong> <span style="color:'+regionColor+'">'+d.region+'</span></p>'+
            '<p><strong>Period:</strong> '+formatYear(d.period.start.year)+' – '+formatYear(d.period.end.year)+'</p>'+
            '<p><strong>Location:</strong> '+d.location.region+' (Modern: '+d.location.modern+')</p>'+
            '</div>'+
            '<h4>Key Developments:</h4><ul>'+
            d.key_developments.map(dev =>
                '<li><strong>'+formatYear(dev.year)+':</strong> '+dev.event+' — <em>'+dev.significance+'</em></li>'
            ).join('')+'</ul>'+
            '<h4>Connections:</h4><ul>'+
            (d.connections||[]).map(conn =>
                '<li><strong>'+conn.civilization+':</strong> '+conn.type+' — '+conn.details+'</li>'
            ).join('')+'</ul>';
        panel.classList.add('visible');
    }

    document.getElementById('zoom-reset').addEventListener('click', () => {
        document.getElementById('details-panel').classList.remove('visible');
    });

    // Scroll sync
    const timelineScroll = document.querySelector('.timeline-scroll');
    const namesColumn    = document.querySelector('.names-column');
    timelineScroll.addEventListener('scroll', () => { namesColumn.scrollTop = timelineScroll.scrollTop; });
    namesColumn.addEventListener('scroll',    () => { timelineScroll.scrollTop = namesColumn.scrollTop; });

}).catch(err => {
    console.error('Timeline failed:', err);
    document.body.innerHTML += '<p style="color:red;padding:20px">Error: '+err.message+'</p>';
});
