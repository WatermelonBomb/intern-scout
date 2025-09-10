u = User.find_by(email: "test-company@example.com")
puts u.authenticate("password123")
puts u.password_digest