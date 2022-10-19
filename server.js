//Imports
const express = require( 'express' );
const router = express.Router();
const fs = require( 'fs' );
const http = require( 'http' );
const { Server } = require( 'socket.io' );


//inicializar express y socket.io ok (antigüo)
/* const express = require('express')
const app = express()


const { Server: HttpServer } = require('http')
const { Server: Socket } = require('socket.io')

const httpServer = new HttpServer(app)
const io = new Socket(httpServer) */

//inicializar express y socket.io ok (nuevo)
const app = express();
const httpServer = http.createServer( app );
const io = new Server( httpServer );

const productos = []
// const chat = []


//--------------------------------------------

// (configuracion del socket anterior)

/* io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!');


    // Productos
    socket.emit('productos', productos);
    socket.on('update-productos', e => {
        productos.push(e)
        io.sockets.emit('productos', productos);
    })


    // Chat
    socket.emit('chat', await chatTxt.getAll());
    socket.on('update-chat', async e => {
        await chatTxt.save(e)
        io.sockets.emit('chat', await chatTxt.getAll());
    })


}); */

//websockets: (socket nuevo)
let date = new Date();
const messages = [
  { author: 'fbanarescarrasco@gmail.com', msg: 'Hola', date: date.toISOString().split('T')[0] + ' ' + date.toLocaleTimeString() },
]

io.on( 'connection', ( socket ) => {
  console.log( 'Usuario conectado, ID: ' + socket.id );

	const read = fs.readFileSync( './productos.txt', 'utf-8' );
	const products = JSON.parse( read );
	socket.emit( 'products', products );
	socket.emit( 'messages', messages );

	socket.on( 'newProduct', ( newProduct ) => {
		const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );
    const productsId = products.map( p => p.id );
    newProduct.id = Math.max( ...productsId ) + 1;

    products.push( newProduct );
		fs.writeFileSync( './productos.txt', JSON.stringify( products, null, '\t' ) );

    io.sockets.emit( 'products', products );
  });

	socket.on( 'newMessage', ( newMessage ) => {
		messages.push( newMessage );
    io.sockets.emit( 'messages', messages );
  });
});

//--------------------------------------------
// agrego middlewares ok

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

//--------------------------------------------
// inicio el servidor ok

const PORT = process.env.PORT || 8080;
const server = httpServer.listen( PORT, () => {
    console.log( `Server on PORT: ${ PORT }` );
});
server.on( 'error', err => console.log( 'Error en el server: ' + err ) );

// Configuramos EJS como motor de plantillas
app.set( 'view engine', 'ejs' );
app.set( 'views', __dirname + '/views' );

//Routes
app.get( '/', ( req, res ) => {
    res.render( 'index', { mesage: '' } );
});

router.get( '/', ( req, res ) => {
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    res.render( 'productos', { products: products } );
});

router.get( '/:id', ( req, res ) => {
    const id = Number( req.params.id );
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    const product = products.find( prod => prod.id === id );
    if ( product == undefined ){
        res.send({ error: 'Producto no encontrado' });
    } else {
        res.json( product );
    }
});

router.post( '/', ( req, res ) => {
    const product = req.body;
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    const productsId = products.map( p => p.id );
    product.id = Math.max( ...productsId ) + 1;

    products.push( product );

    fs.writeFileSync( './productos.txt', JSON.stringify( products, null, '\t' ) );
    res.render( 'index', { mesage: 'Producto agregado' } );
});

router.put( '/:id', ( req, res ) => {
    const id = req.params.id;
    const product = req.body;
    product.id = id;
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    const idx = products.findIndex( p => p.id == id );

    if( idx === -1 ){
        res.send( 'El producto que desea editar no existe.' )
    } else {
        products.splice( idx, 1, product );

        fs.writeFileSync( './productos.txt', JSON.stringify( products, null, '\t' ) );
        res.json( product );
    }
});

//5) Elimina un producto segun su id:
router.delete( '/:id', ( req, res ) => {
    const id = req.params.id;
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    const idx = products.findIndex( p => p.id == id );

    if( idx === -1 ){
        res.send( 'El producto que desea eliminar no existe.' )
    } else {
        products.splice( idx, 1 );

        fs.writeFileSync( './productos.txt', JSON.stringify( products, null, '\t' ) );
        res.json( `Se elimino el producto con id: ${ id }` );
    }
});