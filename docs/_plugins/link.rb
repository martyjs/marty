require 'yaml'

module Jekyll
  class MartyUrl < Liquid::Tag

    VARIABLE_SYNTAX = /(?<variable>[^{]*\{\{\s*(?<name>[\w\-\.]+)\s*(\|.*)?\}\}[^\s}]*)(?<params>.*)/

    def initialize(tag_name, text, tokens)
      super
      @text = text
      config_path = File.expand_path(File.dirname(__FILE__) + "/../_config.yml")
      @version = YAML.load_file(config_path)['current_version']
    end

    def render(context)
      if @text.match(VARIABLE_SYNTAX)
        var = @text.gsub(/{{/, '').gsub(/}}/, '')
        @text = context[var] || ''
      end

      if ENV['VERSION'] == 'true'
        "/v/#{@version}#{@text}"
      else
        @text
      end
    end
  end
end

Liquid::Template.register_tag('url', Jekyll::MartyUrl)