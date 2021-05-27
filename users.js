//buat function helper utk manage user join signin, out, remve & add user
const users = [];

const addUser = ({ id, name, room}) => {
  //convert to lowercase, hapus white space & 1 word aja
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //cek jika user udh ada
  const existingUser = users.find((user) => user.room === room && user.name === name);

  //jika user udh ada akan return error
  if(existingUser){
    return { error: 'Username has alrady taken'}
  }
  
  //jika user blm ada buat baru
  const user = {id, name, room};

  users.push(user);

  return {user}
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1){
    return users.splice(index, 1)[0];
  }
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom};