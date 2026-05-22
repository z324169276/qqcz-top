import { BookOpen, ExternalLink } from 'lucide-react';

const IMA_KNOWLEDGE_BASE_URL = 'https://ima.qq.com/wiki/?shareId=611bc714c4bc19294b599c427640d00431bf063df72587e2f6397be061e64b33';

export function Footer() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 mt-4">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-indigo-100">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 mb-1">亲子教育知识库</h3>
            <p className="text-sm text-gray-500 mb-3">
              了解更多育儿知识和技巧，帮助孩子更好地成长
            </p>
            <a
              href={IMA_KNOWLEDGE_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <span>立即查看</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-gray-400">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-500 underline underline-offset-2"
        >
          鄂ICP备2021020060号-6
        </a>
      </div>
    </div>
  );
}
