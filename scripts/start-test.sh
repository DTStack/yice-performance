sed -i -- 's/3306/6033/g' .env
sed -i -- 's/4000/4001/g' .env

# pnpm -v
pnpm install
pnpm pm2:test
