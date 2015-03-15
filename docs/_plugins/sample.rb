module Jekyll
  module Tags
    class SampleBlock < Liquid::Block
      include Liquid::StandardFilters

      def initialize(tag_name, markup, tokens)
        super
      end

      def render(context)
        code = super.to_s

        lines = code.split("\n")
        styles = {}
        current_style = nil

        lines.each_with_index do |line, index|
          if line =~ /^==/
            if current_style
              styles[current_style].pop
            end

            current_style = lines[index -1]
            styles[current_style] = []
          elsif current_style
            styles[current_style] << line
          end
        end

        output = "<div class=\"sample\">"

        output += "\t<div class=\"btn-group zero-clipboard\" role=\"group\">"

        styles.each do |style, lines|
          output += "\t<button type=\"button\" data-style=\"#{style}\" class=\"btn btn-default #{style}\">#{style}</button>"
        end

        output += "\t</div>"

        styles.each do |style, lines|
          code = lines.join("\n").strip

          output += add_code_tag(render_rouge(code), style)
        end

        output += "\n</div>"
      end


      def render_rouge(code)
        require('rouge')
        formatter = Rouge::Formatters::HTML.new(line_numbers: false, wrap: false)
        lexer = Rouge::Lexer.find_fancy('js', code)
        formatter.format(lexer.lex(code))
      end

      def add_code_tag(code, style)
        code_attributes = [
          "data-lang=\"js\"",
          "class=\"language-js\""
        ].join(" ")
        "<div class=\"highlight\" data-style=\"#{style}\"><pre><code #{code_attributes}>#{code.chomp}</code></pre></div>"
      end
    end
  end
end

Liquid::Template.register_tag('sample', Jekyll::Tags::SampleBlock)