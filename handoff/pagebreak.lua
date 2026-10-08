local sheets = 0
function Div(element)
  if element.classes:includes('sheet') then
    sheets = sheets + 1
    if sheets > 1 then
      element.content:insert(1, pandoc.RawBlock('openxml', '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'))
    end
    return element.content
  end
end
