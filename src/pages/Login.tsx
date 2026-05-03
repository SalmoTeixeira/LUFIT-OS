import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, LogIn } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const enableDemo = () => {
    localStorage.setItem('lufit_admin_demo', 'true');
    window.location.hash = '/admin';
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <img src="/logo-lufit-v2.png" alt="LUFIT" className="h-16 mx-auto rounded-lg" />
          <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
          <p className="text-sm text-[#6E6E80]">LUFIT Moda Praia e Fitness — Centro de Comando</p>
        </div>

        <Card className="bg-[#14141E] border-[#1E1E2E] text-white">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#2DD4A8]/10 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-[#2DD4A8]" />
            </div>
            <CardTitle className="text-base text-white">Autenticação Kimi OAuth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold"
              size="lg"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with Kimi
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1E1E2E]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#14141E] px-2 text-[#6E6E80]">ou modo demonstração</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-[#1E1E2E] text-[#A0A0B0] hover:text-white hover:bg-[#1E1E2E]"
              size="lg"
              onClick={enableDemo}
            >
              <Lock className="w-4 h-4 mr-2" />
              Acessar Modo Demo
            </Button>

            <p className="text-[10px] text-[#6E6E80] text-center">
              O modo demo é para testes locais. Em produção, o login OAuth é obrigatório.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
