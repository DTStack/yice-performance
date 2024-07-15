sed -i -- 's/4000/4001/g' .env

# pnpm -v
pnpm install --production
pnpm pm2:test
