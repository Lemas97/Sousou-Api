module.exports = {
  apps : [{
    name   : "sousou-dev",
    script : "./src/main.ts",
     env_development: {
        NODE_ENV: "development",
        DB_DATABASE: "sousou-dev",
	PORT:3400,
	FRONT_URL:"https://dev.sousou.me"
    }
  }]
}
