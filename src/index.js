const express = require('express')
const app = express();
const io = require('socket.io');
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.set("view engine","ejs");
app.use(express.static("public"))


app.get('/', (req,res)=>{
	res.render('pages/index');
})

const server = app.listen(PORT,() => console.log(`Server running on port ${PORT}`));

const socketIO = io(server);
let usersOnline = [];


/*function isRepeat(usersOnline,user,id){
	
	let isRepeat = usersOnline.filter(function(e){ 
		return e.username === user;
	});

	if(isRepeat.length >= 1){
		return {username: `Usuario ${user}`, socket: id}
	}

	return {username: user, socket: id}
}*/



socketIO.on('connection',(socket)=>{

	socket.on('disconnect', () => {
		let newList = usersOnline.filter(index => index.socket !== socket.id);
		usersOnline = newList;
		socketIO.emit("chat:listUsers",usersOnline);
	});

	socket.on('chat:join', (username) =>{
		usersOnline.push({username: username, socket: socket.id})
		socketIO.emit('chat:listUsers',usersOnline)
		socketIO.to(socket.id).emit('chat:join',socket.id)
	})

	socket.on('chat:privateMessage', (data) =>{
		socketIO.to(data.id).emit('chat:privateMessage',data)
	})

})