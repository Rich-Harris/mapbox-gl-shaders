const fs = require( 'fs' );

const files = fs.readdirSync( 'src' );

let shaders = {};

files.forEach( file => {
	const name = file.slice( 0, file.indexOf( '.' ) );
	const type = /fragment/.test( file ) ? 'fragmentSource' : 'vertexSource';

	if ( !shaders[ name ] ) shaders[ name ] = {};
	shaders[ name ][ type ] = fs.readFileSync( `src/${file}`, 'utf-8' );
});

var result = Object.keys( shaders ).map( name => {
	const shader = shaders[ name ];

	return `export var ${name} = ${JSON.stringify( shader, null, '  ' )}`;
}).join( '\n\n' ) + `

export var util = ${JSON.stringify( fs.readFileSync( 'util.vertex.glsl', 'utf-8' ) )};`;

fs.writeFileSync( 'dist/mapbox-gl-shaders.es.js', result );
