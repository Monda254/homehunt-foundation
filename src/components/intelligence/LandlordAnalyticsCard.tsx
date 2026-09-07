import React from "react";
import { TrendingUp, Eye, Heart, Calendar, FileText, Lightbulb } from "lucide-react";

interface LandlordAnalyticsCardProps {
  listingTitle: string;
  views: number;
  saves: number;
  viewingRequests: number;
  applications: number;
  conversionRate: number;
  recommendationTip?: string;
}

export const LandlordAnalyticsCard: React.FC<LandlordAnalyticsCardProps> = ({
  listingTitle,
  views,
  saves,
  viewingRequests,
  applications,
  conversionRate,
  recommendationTip,
}) => {
  const defaultTip =
    views > 100 && viewingRequests < 5
      ? "Your listing receives high views but few viewing requests. Consider improving photo completeness and clarifying utility details."
      : "Listing performance is strong. Keep availability details up to date to maintain fresh ranking.";

  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-start border-b pb-3">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Listing Performance Analytics
          </span>
          <h4 className="text-sm font-bold text-foreground mt-0.5">{listingTitle}</h4>
        </div>
        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-lg border border-primary/20">
          {conversionRate}% View → App
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 bg-secondary/30 rounded-xl border">
          <Eye className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
          <span className="text-sm font-black text-foreground block">{views}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Views</span>
        </div>
        <div className="p-2.5 bg-secondary/30 rounded-xl border">
          <Heart className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
          <span className="text-sm font-black text-foreground block">{saves}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Saves</span>
        </div>
        <div className="p-2.5 bg-secondary/30 rounded-xl border">
          <Calendar className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
          <span className="text-sm font-black text-foreground block">{viewingRequests}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Viewings</span>
        </div>
        <div className="p-2.5 bg-secondary/30 rounded-xl border">
          <FileText className="h-3.5 w-3.5 text-verified mx-auto mb-1" />
          <span className="text-sm font-black text-verified block">{applications}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Apps</span>
        </div>
      </div>

      <div className="p-3 bg-secondary/40 rounded-xl border flex items-start gap-2 text-xs">
        <Lightbulb className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground">Optimization Guidance: </span>
          {recommendationTip || defaultTip}
        </p>
      </div>
    </div>
  );
};
