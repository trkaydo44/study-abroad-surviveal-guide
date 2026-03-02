// auth.js
function getUsers() {
  return JSON.parse(localStorage.getItem("sabsg_users") || "[]");
}
function saveUsers(users) {
  localStorage.setItem("sabsg_users", JSON.stringify(users));
}

function registerUser(name, email, password) {
  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return { ok:false, message:"This email is already registered." };

  users.push({ name, email, password });
  saveUsers(users);
  return { ok:true };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { ok:false, message:"Wrong email or password." };

  localStorage.setItem("sabsg_user", JSON.stringify({ name:user.name, email:user.email }));
  return { ok:true };
}

function requireLogin() {
  const user = JSON.parse(localStorage.getItem("sabsg_user") || "null");
  if (!user) location.href = "login.html";
  return user;
}