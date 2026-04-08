import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Brain, Clock, Target, MoreVertical, Eye, Edit, Trash2,
  ListChecks, Sparkles, Copy, Archive, BarChart3, FileText, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrainingDocumentCard({
  document,
  stats = {},
  isAdmin = false,
  onEdit,
  onDelete,
  onManageQuestions,
  onGenerateQuiz,
  onDuplicate,
  onArchive,
  onViewStats
}) {
  const getCategoryColor = (category) => {
    const colors = {
      'Product Knowledge': 'bg-blue-100 text-blue-800',
      'Objection Handling': 'bg-purple-100 text-purple-800',
      'Discovery Techniques': 'bg-green-100 text-green-800',
      'Closing Strategies': 'bg-orange-100 text-orange-800',
      'Competitor Intelligence': 'bg-red-100 text-red-800',
      'Compliance': 'bg-gray-100 text-gray-800',
      'Sales Methodology': 'bg-teal-100 text-teal-800',
      'Communication Skills': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  const getDifficultyColor = (level) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-700',
      'intermediate': 'bg-yellow-100 text-yellow-700',
      'advanced': 'bg-red-100 text-red-700'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  const hasQuestions = document.question_count > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 mb-2">
              {document.file_url && (
                <FileText className="w-4 h-4 text-blue-600" />
              )}
              <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">
              {document.description}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-4 right-4">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl(`TrainerBot?docId=${document.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Training
                </Link>
              </DropdownMenuItem>

              {hasQuestions && (
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl(`CertificationTest?docId=${document.id}`)}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Preview Quiz
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => onViewStats && onViewStats(document)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Statistics
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => onEdit && onEdit(document)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Training
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onManageQuestions && onManageQuestions(document)}>
                    <ListChecks className="w-4 h-4 mr-2" />
                    Manage Questions
                    {hasQuestions && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {document.question_count}
                      </Badge>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onGenerateQuiz && onGenerateQuiz(document)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate New Quiz
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onDuplicate && onDuplicate(document)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate Training
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => onArchive && onArchive(document)}>
                    <Archive className="w-4 h-4 mr-2" />
                    {document.is_active ? 'Archive' : 'Activate'}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onDelete && onDelete(document)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Training
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge className={getCategoryColor(document.category)}>
            {document.category}
          </Badge>
          <Badge className={getDifficultyColor(document.difficulty_level)}>
            {document.difficulty_level}
          </Badge>
          {hasQuestions && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <ListChecks className="w-3 h-3 mr-1" />
              {document.question_count} questions
            </Badge>
          )}
          {!document.is_active && (
            <Badge variant="outline" className="bg-slate-100 text-slate-600">
              Archived
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {document.estimated_time_minutes} min
            </span>
            <span className="text-slate-600 flex items-center gap-1">
              <Target className="w-4 h-4" />
              Pass: {document.passing_score}%
            </span>
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Completion Rate</span>
              <span className="font-semibold text-slate-900">
                {Math.round(stats.completionRate || 0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Avg Score</span>
              <span className="font-semibold text-slate-900">
                {stats.avgScore || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Learners</span>
              <span className="font-semibold text-slate-900">
                {stats.uniqueUsers || 0}
              </span>
            </div>
          </div>

          <div className="pt-3">
            <Link to={createPageUrl(`TrainerBot?docId=${document.id}`)} className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Brain className="w-4 h-4 mr-2" />
                Start Training
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
