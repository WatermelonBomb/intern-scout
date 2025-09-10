u = User.create!(email: "test-company@example.com", password: "password123", first_name: "Test", last_name: "Company", user_type: "company")
puts u.id
puts u.email