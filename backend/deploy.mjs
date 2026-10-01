#!/usr/bin/env node
/*
 * Deploy do backend (Apps Script) — Projeto Gideão 300.
 *   1) clasp push -f   -> sobe Code.gs + appsscript.json
 *   2) clasp deploy -i <DEPLOYMENT_ID> -> republica a MESMA Web App (mantém a URL /exec)
 *
 * Pré-requisitos (uma vez — ver SETUP):
 *   - npm run login            (clasp login — autoriza a conta Google)
 *   - .clasp.json (scriptId) e .deploy.json (deploymentId) presentes
 *
 * Uso diário:  npm run deploy
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

function fail(msg) { console.error('\n❌ ' + msg + '\n'); process.exit(1); }
function run(cmd) { console.log('▶ ' + cmd); execSync(cmd, { stdio: 'inherit' }); }

if (!existsSync('.clasp.json')) fail('.clasp.json não encontrado (scriptId).');
if (!existsSync('.deploy.json')) fail('.deploy.json não encontrado (deploymentId).');

let deploymentId;
try { deploymentId = JSON.parse(readFileSync('.deploy.json', 'utf8')).deploymentId; }
catch (e) { fail('.deploy.json inválido (não é JSON válido).'); }
if (!deploymentId || deploymentId.startsWith('SEU_') || deploymentId.startsWith('COLE_')) {
  fail('deploymentId ausente/placeholder em .deploy.json.');
}

try {
  run('clasp push -f');
  run(`clasp deploy -i ${deploymentId} -d "auto-deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"`);
  console.log('\n✅ Deploy concluído. A URL /exec da Web App permanece a mesma.\n');
} catch (e) {
  fail('Falha no deploy. Se disse "User has not enabled the Apps Script API", ative em https://script.google.com/home/usersettings. Se for credencial/login, rode: npm run login');
}
