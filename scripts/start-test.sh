sed -i -- 's/4000/4001/g' .env

# pnpm -v
pnpm install --production
pm2 restart ./pm2/config-test.json --env staging
