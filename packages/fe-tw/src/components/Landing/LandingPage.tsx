"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, Users, Vote, TrendingUp, Shield, Zap } from "lucide-react";
import Link from "next/link";
import HeroAnimation from "./HeroAnimation";

const LandingPage = () => {
   return (
      <div className="min-h-screen bg-white">
         <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 min-h-[90vh]">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
               <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative container mx-auto px-4 py-12 lg:py-20">
               <div className="grid md:grid-cols-2 gap-12 items-center min-h-[80vh]">
                  {/* Left side - Content */}
                  <div className="place-self-center max-md:text-center z-10">
                     <div className="relative">
                        {/* Gradient backdrop similar to ethereum.org */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl blur-2xl" />

                        <div className="relative">
                           <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
                              Tokenize Real Estate
                              <br />
                              <span className="text-3xl md:text-4xl lg:text-5xl text-indigo-400">
                                 Unlock Global Investment
                              </span>
                           </h1>
                           <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
                              Transform physical buildings into digital assets. Enable fractional
                              ownership, earn rewards, and participate in decentralized governance of real
                              estate investments.
                           </p>
                           <div className="flex flex-col sm:flex-row gap-4 max-md:justify-center">
                              <Link href="/building">
                                 <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-500/25 text-lg px-8"
                                 >
                                    Start Investing
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                 </Button>
                              </Link>
                              <Link href="/explorer">
                                 <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-indigo-400/50 bg-indigo-950/50 text-white hover:bg-indigo-900/60 text-lg px-8"
                                 >
                                    Explore
                                 </Button>
                              </Link>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Right side - Animation */}
                  <div className="place-self-center w-full max-w-[600px] max-md:max-w-[400px]">
                     <HeroAnimation />
                  </div>
               </div>
            </div>
         </section>

         <section className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(99,102,241,0.03)_1px,_transparent_1px)] bg-[length:40px_40px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_rgba(168,85,247,0.02)_1px,_transparent_1px)] bg-[length:60px_60px] opacity-50" />

            <div className="relative container mx-auto px-4">
               <div className="max-w-3xl mx-auto text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                     Why Choose Our Platform?
                  </h2>
                  <p className="text-xl text-gray-600">
                     We're revolutionizing real estate investment through blockchain technology,
                     making it accessible, transparent, and profitable for everyone.
                  </p>
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                  <Card className="text-center border-0 bg-gradient-to-br from-white to-gray-50/50">
                     <CardContent className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                           <Building2 className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">
                           Fractional Ownership
                        </h3>
                        <p className="text-gray-600">
                           Own a piece of premium real estate with as little as $100. No more
                           barriers to property investment.
                        </p>
                     </CardContent>
                  </Card>

                  <Card className="text-center border-0 bg-gradient-to-br from-white to-gray-50/50">
                     <CardContent className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                           <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Passive Income</h3>
                        <p className="text-gray-600">
                           Earn regular rewards from rental income and property appreciation
                           directly to your wallet.
                        </p>
                     </CardContent>
                  </Card>

                  <Card className="text-center border-0 bg-gradient-to-br from-white to-gray-50/50">
                     <CardContent className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                           <Vote className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">DAO Governance</h3>
                        <p className="text-gray-600">
                           Vote on property decisions proportional to your holdings. Have a real say
                           in your investments.
                        </p>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </section>

         <section className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-indigo-200 to-white" />

            <div className="relative container mx-auto px-4">
               <div className="max-w-3xl mx-auto text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                     How It Works
                  </h2>
                  <p className="text-xl text-gray-600">
                     Simple steps to start your real estate investment journey
                  </p>
               </div>

               <div className="max-w-4xl mx-auto">
                  <div className="grid md:grid-cols-4 gap-8">
                     <Card className="text-center border-0 bg-white/40 backdrop-blur-sm">
                        <CardContent className="relative">
                           <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
                              1
                           </div>
                           <h3 className="font-semibold mb-2 text-gray-900">Connect Wallet</h3>
                           <p className="text-sm text-gray-600">
                              Connect your Hedera wallet to get started
                           </p>
                        </CardContent>
                     </Card>

                     <Card className="text-center border-0 bg-white/40 backdrop-blur-sm">
                        <CardContent className="relative">
                           <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
                              2
                           </div>
                           <h3 className="font-semibold mb-2 text-gray-900">Browse Properties</h3>
                           <p className="text-sm text-gray-600">
                              Explore tokenized buildings and their details
                           </p>
                        </CardContent>
                     </Card>

                     <Card className="text-center border-0 bg-white/40 backdrop-blur-sm">
                        <CardContent className="relative">
                           <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
                              3
                           </div>
                           <h3 className="font-semibold mb-2 text-gray-900">Invest</h3>
                           <p className="text-sm text-gray-600">
                              Purchase tokens representing ownership shares
                           </p>
                        </CardContent>
                     </Card>

                     <Card className="text-center border-0 bg-white/40 backdrop-blur-sm">
                        <CardContent className="relative">
                           <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
                              4
                           </div>
                           <h3 className="font-semibold mb-2 text-gray-900">Earn & Govern</h3>
                           <p className="text-sm text-gray-600">
                              Receive rewards and vote on property decisions
                           </p>
                        </CardContent>
                     </Card>
                  </div>
               </div>
            </div>
         </section>

         <section className="py-20 relative bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(99,102,241,0.03)_1px,_transparent_1px)] bg-[length:50px_50px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(168,85,247,0.02)_1px,_transparent_1px)] bg-[length:40px_40px] opacity-70" />

            <div className="relative container mx-auto px-4">
               <div className="max-w-6xl mx-auto">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                     <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                           Built for the Future of Real Estate
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                           Our platform combines cutting-edge blockchain technology with traditional
                           real estate expertise to create unprecedented opportunities.
                        </p>

                        <div className="space-y-6">
                           <Card className="flex items-start border-0 bg-gradient-to-r from-indigo-50/50 to-transparent">
                              <CardContent className="flex items-start relative">
                                 <Shield className="h-6 w-6 text-indigo-600 mt-1 mr-4 flex-shrink-0" />
                                 <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                       Secure & Transparent
                                    </h3>
                                    <p className="text-gray-600">
                                       All transactions and ownership records are immutably stored
                                       on the Hedera blockchain
                                    </p>
                                 </div>
                              </CardContent>
                           </Card>

                           <Card className="flex items-start border-0 bg-gradient-to-r from-purple-50/50 to-transparent">
                              <CardContent className="flex items-start relative">
                                 <Zap className="h-6 w-6 text-indigo-600 mt-1 mr-4 flex-shrink-0" />
                                 <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                       Instant Liquidity
                                    </h3>
                                    <p className="text-gray-600">
                                       Trade your property tokens anytime without the hassle of
                                       traditional real estate sales
                                    </p>
                                 </div>
                              </CardContent>
                           </Card>

                           <Card className="flex items-start border-0 bg-gradient-to-r from-indigo-50/50 to-transparent">
                              <CardContent className="flex items-start relative">
                                 <Users className="h-6 w-6 text-indigo-600 mt-1 mr-4 flex-shrink-0" />
                                 <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                       Community Driven
                                    </h3>
                                    <p className="text-gray-600">
                                       Join a community of investors making collective decisions
                                       about property management
                                    </p>
                                 </div>
                              </CardContent>
                           </Card>
                        </div>
                     </div>

                     <div className="relative">
                        <Card className="relative bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl border-0">
                           <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:20px_20px] rounded-2xl" />
                           <CardContent className="relative grid grid-cols-2 gap-6">
                              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                                 <div className="relative text-3xl font-bold mb-2">$2.5M+</div>
                                 <div className="text-indigo-200">Total Value Locked</div>
                              </div>
                              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                                 <div className="relative text-3xl font-bold mb-2">15+</div>
                                 <div className="text-indigo-200">Properties Tokenized</div>
                              </div>
                              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                                 <div className="relative text-3xl font-bold mb-2">1,200+</div>
                                 <div className="text-indigo-200">Active Investors</div>
                              </div>
                              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                                 <div className="relative text-3xl font-bold mb-2">8.5%</div>
                                 <div className="text-indigo-200">Average APY</div>
                              </div>
                           </CardContent>
                        </Card>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700" />
            <div className="absolute inset-0 opacity-20">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:60px_60px]" />
            </div>

            <div className="relative container mx-auto px-4 text-center text-white">
               <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Revolutionize Your Investment Portfolio?
               </h2>
               <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
                  Join thousands of investors who are already earning passive income through
                  tokenized real estate. Start with as little as $100.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/building">
                     <Button size="lg" variant="secondary">
                        Get Started Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                     </Button>
                  </Link>
                  <Link href="/faq">
                     <Button size="lg">Learn More</Button>
                  </Link>
               </div>
            </div>
         </section>
      </div>
   );
};

export default LandingPage;
