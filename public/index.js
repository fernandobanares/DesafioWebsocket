function renderProduct( data ){
  const html = data.map( prod => {
    return (`
      <tr scope="row">
        <td>${ prod.title }</td>
        <td>$${ prod.price }</td>
        <td><img src="${ prod.thumbnail }" alt="img" style="width: 80px; height: 80px;"></td>
      </tr>
    `)
  } ).join( "" );
  document.getElementById( "products" ).innerHTML = html;
}

function renderMessage( data ){
  const html = data.map( msg => {
    return (`
      <div>
        <strong style="color: blue">${ msg.author }</strong>
        <p style="color: brown; font-size: 14px; display: inline-block">[ ${ msg.date } ] :</p>
        <em style="color: green">${ msg.msg }</em>
      </div>
    `)
  } ).join( "" );
  document.getElementById( "chat" ).innerHTML = html;
}

const socket = io.connect();
socket.on( 'products', ( data ) => {
  renderProduct( data )
});

socket.on( 'messages', ( data ) => {
  renderMessage( data )
});

const form = document.getElementById( "form" );
form.addEventListener( 'submit', ( e ) => {
  e.preventDefault();
  const newProduct = {
    title: document.getElementById( 'title' ).value,
    price: document.getElementById( 'price' ).value,
    thumbnail: document.getElementById( 'thumbnail' ).value
  }
	socket.emit( 'newProduct', newProduct );
  return false;
} );

const formChat = document.getElementById( "form-chat" );
formChat.addEventListener( 'submit', ( e ) => {
  const date = new Date();
  e.preventDefault();
  const newMessage = {
    author: document.getElementById( 'email' ).value,
    msg: document.getElementById( 'text-input' ).value,
    date: date.toISOString().split('T')[0] + ' ' + date.toLocaleTimeString()
  }
	socket.emit( 'newMessage', newMessage );
  return false;
} );